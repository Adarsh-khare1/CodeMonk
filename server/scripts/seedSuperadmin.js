import User from '../models/User.model.js';

export const seedSuperadmin = async () => {
  try {
    const email = 'adarshkhare.codes@gmail.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: 'adarsh',
        email,
        password: '123456',
        role: 'superadmin'
      });
      await user.save();
      console.log('✅ Superadmin created');
    } else {
      if (user.role !== 'superadmin') {
        user.role = 'superadmin';
        await user.save();
        console.log('✅ Updated adarshkhare.codes@gmail.com to superadmin');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding superadmin:', error);
  }
};
