/**
 * Created by cp on 1/8/14.
 */
function User(opts){
    if(arguments.length == 0)
    {
        this.id = 0;
        this.name = "";
        this.uid = "";
        this.token = "";
        this.phone_number = "";
        this.phone_numbers = new Array();
        this.money = 0;
        this.password = "";
    }
    else
    {
        this.id = opts.id;
        this.name = opts.name;
        this.uid = opts.uid;
        this.token = opts.token;
        this.phone_number = opts.phone_number;
        this.phone_numbers = opts.phone_numbers;
        this.money = opts.money;
        this.password = opts.password;
    }

}

module.exports = User;

User.prototype.toJSON = function()
{
    return {
        id: this.id,
        uid: this.uid,
        name: this.name,
        phone_number: this.phone_number,
        token: this.token,
        phone_numbers:this.phone_numbers,
        balance:this.money,
        password:this.password
    };
};