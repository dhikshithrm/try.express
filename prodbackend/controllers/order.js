const { Order, ProductCart} = require("../models/order");
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")("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");


exports.getOrderById = (req,res,next,id) =>{
    Order.findById(id)
    .populate("products.product", "name price")
    .exec((err,order)=>{
        if(err){
            res.status(400).json({
                error: "No Order Found In DB"
            })
        }
        req.order = order;
        next();
    });
}


exports.createOrder = (req,res)=>{
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((err, order)=>{
        if(err){
            return res.status(400).json({
                error: "Failed to save order to DB"
            })
        }
        res.json(order);
    })
}

exports.getAllOders = (req,res) => {
    Order.find().populate("user", "_id name").exec((err,orders) => {
        if(err){
            return res.status(400).json({
                error: "No Orders found"
            })
        }
        res.json(orders);
    })
}

exports.getOrderStatus = (req, res) => {
    res.json(Order.schema.path("status").enumValues);
}
exports.updateStatus = (req, res) => {
    Order.update(
        {_id: req.body.orderId},
        {$set: {status: req.body.status}},
        (err, order) => {
            if(err){
                return res.status(400).json({
                    error: "Failed To Update"
                })

            }
            res.json(order);
        }
    )
}

const getFinalPrice = (products)=>{
    let amount = 0;
    products.map((product)=>{
        amount+=product.price
    })
    return amount
}

exports.handlePayments = (req, res) => {
    const {products, token} = req.body
    const idempotencyKey = uuidv4();
    const totalPrice = getFinalPrice(products)

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer=>{
        stripe.charges.create({
            amount: totalPrice*100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `purchase of t-shirt`,
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2:token.card.address_line2,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postal_code: token.card.address_zip
                }
            }
        },{idempotencyKey}).then(result => res.status(200).json(result))
        .catch(err => console.log(err))
    })
}