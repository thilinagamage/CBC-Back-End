import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res){
    
    if(req.user == null){
        res.status(401).json({
            message : "Unathorized"
        })
        return;
    }

    const body = req.body;
    
console.log("Bill Items Received:", body.billItems);

    const orderData = {
        orderId : "",
        email : req.user.email,
        name : body.name,
        address : body.address,
        phoneNumber : body.phoneNumber,
        billItems : [],
        total : 0
    }
   Order.find().
   sort({
        date : -1

    }).limit(1).then(async (lastBills) => {
        if(lastBills.length == 0){
            orderData.orderId = "ORD0001";
        }else{
            const lastBill = lastBills[0];
    
            const lastOrderId = lastBill.orderId;
            const lastOrderNumber = lastOrderId.replace("ORD","");
            const lastOrderNumberInt =  parseInt(lastOrderNumber);
            const newOrderNumberInt = lastOrderNumberInt + 1;
            const newOrderNumberString = newOrderNumberInt.toString().padStart(4, "0");
            orderData.orderId = "ORD" + newOrderNumberString;
            
        }

        for(let i = 0; i < body.billItems.length; i++){
    const product = await Product.findOne({ productId: body.billItems[i].productId });

    if(product == null){
        res.status(404).json({
            message : "Product with product id " + body.billItems[i].productId + " not found"
        });
        return;
    }

    console.log("Product found:", product);

    const billItem = {
        productId : product.productId,
        productName : product.name,
        price : product.price,
        quantity : body.billItems[i].quantity,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    };

    console.log("Bill Item being added:", billItem);

    orderData.billItems[i] = billItem;
    orderData.total += product.price * body.billItems[i].quantity;
}
        
        const order = new Order(orderData);



        order.save().then(
            () => {
                res.json({ 
                    message : "Order saved successfully",
                    
                    
                });
            }
        ).catch(
            (err) => {
                res.status(500).json({
                    message : "Order not saved",
                });
            }
        );
    });

  

}


export function getOrders(req, res){
    if(req.user == null){
        res.status(401).json({
            message : "Unathorized"
        })
        return;
    }

    if(req.user.role == "admin"){
        Order.find().then(
            (orders) => {
                res.json(orders)
            }
        ).catch(
            (err) => {
                res.status(500).json({
                    message : "Orders not found"
                })
            }
        )
    }else{
        Order.find({
            email : req.user.email
        }).then(
            (orders) => {
                res.json(orders)
            }
        ).catch(
            (err) => {
                res.status(500).json({
                    message : "Orders not found"
                })
            }
        )
    }
}

export async function updateOrder(req, res){
    try{
        if(req.user == null){
            res.status(401).json({
                message : "Unathorized"
            })
            return;
        }
        const orderId = req.params.orderId;
        const order = await Order.findOneAndUpdate({
            orderId : orderId          
        },req.body)
        
        res.json({
            message : "Order updated successfully"
        })
        }catch(err){
        res.status(500).json({
            message : "Order not updated"
        })
    }
}