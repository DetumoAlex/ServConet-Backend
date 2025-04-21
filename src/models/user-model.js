const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const validator = require("validator")
const {mailSender} = require("../utils/email-utils")

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    passwordResetOtp: { type: String, default: null },
    passwordResetOtpExpires: { type: Date, default: null },
    passwordResetVerified: { type: Boolean, default: false },
    resetToken: { type: String, default: null }, 
    resetTokenExpires: { type: Date, default: null },
    emailVerificationOTP: { type: String, default: null },
    emailVerificationOTPExpires: { type: Date, default: null },
    role:{type:String, enum:["customer", "provider", "admin"], default:'customer', required:true},
    servicesOffered:[{type:mongoose.Schema.Types.ObjectId, ref:"Service"}],
    servicesBooked:[{type:mongoose.Schema.Types.ObjectId, ref:"Service"}],
    reviews:[{type:mongoose.Schema.Types.ObjectId, ref:"Review"}]
},{collection:"users"})


// Remove servicesOffered if the user is a customer
userSchema.pre("save", async function (next) {
    if (this.role === "customer, admin") {
      this.servicesOffered = undefined;
      this.reviews = undefined; // Removes the field before saving
    } else if (this.role ==="provider"){
        this.servicesBooked = undefined
    }

// Function to send email to user after registration
if (this.isNew) {
    try {
      await mailSender({
        to: this.email,
        subject: "🎉 Welcome to Servconet!",
        body: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4CAF50;">Welcome on board, ${this.name}! 👋</h2>
            <p>We're excited to have you join <strong>Servconet</strong> — your go-to platform for discovering and offering services.</p>
            <p>Here’s what you can do with your new account:</p>
            <ul>
              <li>🔍 Explore available services tailored to your needs</li>
              <li>🛠️ Offer your own services and connect with clients</li>
              <li>💬 Chat with providers and negotiate deals</li>
            </ul>
            <p>Don’t forget to complete your profile to get the most out of our platform. 👍</p>
            <hr />
            <p style="font-size: 0.9em; color: #888;">Need help? Reply to this email or contact support from your dashboard.</p>
          </div>
        `,
      });
  
      console.log("✅ Welcome email sent to", this.email);
    } catch (error) {
      console.error("❌ Error occurred while sending email:", error);
      throw error;
    }
  }
  

    next();
  });

  // static signup method
userSchema.statics.signup = async function (name, email, password, role) {

    // validation
    if(!name || !email || !password || !role){
        throw Error('All fields must be filled')
    }
    if (!validator.isEmail(email)){
        throw Error('Email is not valid')
    }
    if (!validator.isStrongPassword(password)){
        throw Error('Password not strong enough')
    }

    const exists = await this.findOne({email})
    if (exists){
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({name, email, password:hash, role})
    
    // ✅ If user is a provider, create a default service
    if (role === "provider") {
        const defaultService = new Service({
            title: "New Provider Service",
            description: "This is a default service description.",
            price: 0, // Set a default price
            category: "General",
            provider: user._id, // Assign provider's ID
        });

        await defaultService.save();
    }
    return user


}


// static login method
userSchema.statics.login = async function (email, password){

    // validation
    if(!email || !password){
        throw Error('All fields must be filled')
    }
    const user = await this.findOne({email})
    if (!user){
        throw Error('Incorrect Email')
    }
    const match = await bcrypt.compare(password, user.password)

    if(!match){
        throw Error('Incorrect password')
    }

    return user

}
module.exports = mongoose.model("User", userSchema)