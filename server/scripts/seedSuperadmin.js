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
      // Use updateOne to avoid full-document revalidation on existing records
      // (old records may be missing fields that are now required)
      const updates = {};
      if (user.role !== 'superadmin') updates.role = 'superadmin';
      if (!user.username) updates.username = 'adarsh';

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ email }, { $set: updates });
        console.log('✅ Updated superadmin:', updates);
      } else {
        console.log('✅ Superadmin already up to date');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding superadmin:', error);
  }
};

