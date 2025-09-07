    const { Schema, model } = require("mongoose");

    const coinSchema = new Schema({
        c_id:{
            type: String,
            required: true,
            unique: true
        },
        c_name :{
            type : String
        },
        price:{
            type : Number
        }
    });

    const  Coins = model("Coin", coinSchema);

    module.exports = Coins;