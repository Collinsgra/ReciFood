const User = require('../models/User');
const Recipe = require('../models/Recipe');
const BlogPost = require('../models/BlogPost');
const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalRecipes = await Recipe.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const mostViewedRecipes = await Recipe.find().sort('-views').limit(5).select('title views');

    res.json({ totalRecipes, activeUsers, mostViewedRecipes });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const recentRecipes = await Recipe.find().sort('-createdAt').limit(5).select('title createdAt');
    const recentComments = await Comment.find().sort('-createdAt').limit(5).select('content createdAt').populate('user', 'name');
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email createdAt');

    const recentActivity = [
      ...recentRecipes.map(r => ({ type: 'recipe', ...r.toObject() })),
      ...recentComments.map(c => ({ type: 'comment', ...c.toObject() })),
      ...recentUsers.map(u => ({ type: 'user', ...u.toObject() }))
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

    res.json(recentActivity);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('createdBy', 'name');
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
};

exports.updateRecipeStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error in updateRecipeStatus:', error);
    res.status(500).json({ message: 'Error updating recipe status' });
  }
};

exports.approveRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error approving recipe', error: error.message });
  }
};

exports.rejectRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting recipe', error: error.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};

exports.getFeaturedRecipes = async (req, res) => {
  try {
    const featuredRecipes = await Recipe.find({ featured: true }).populate('createdBy', 'name');
    res.json(featuredRecipes);
  } catch (error) {
    console.error('Error in getFeaturedRecipes:', error);
    res.status(500).json({ message: 'Error fetching featured recipes' });
  }
};

exports.featureRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, { featured: true }, { new: true });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error in featureRecipe:', error);
    res.status(500).json({ message: 'Error featuring recipe' });
  }
};

exports.unfeatureRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, { featured: false }, { new: true });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error in unfeatureRecipe:', error);
    res.status(500).json({ message: 'Error unfeaturing recipe' });
  }
};

exports.getBlogPosts = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find().populate('author', 'name').sort('-publishDate');
    res.json(blogPosts);
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
};

exports.createBlogPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, tags } = req.body;
    const blogPost = new BlogPost({
      title,
      content,
      tags,
      author: req.user._id
    });
    await blogPost.save();
    res.status(201).json(blogPost);
  } catch (error) {
    console.error('Error in createBlogPost:', error);
    res.status(500).json({ message: 'Error creating blog post' });
  }
};

exports.getBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate('author', 'name');
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(blogPost);
  } catch (error) {
    console.error('Error in getBlogPost:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
};

exports.updateBlogPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, tags } = req.body;
    const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, {
      title,
      content,
      tags
    }, { new: true });
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(blogPost);
  } catch (error) {
    console.error('Error in updateBlogPost:', error);
    res.status(500).json({ message: 'Error updating blog post' });
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    res.status(500).json({ message: 'Error deleting blog post' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name')
      .populate('recipe', 'title')
      .sort('-createdAt');
    res.json(comments);
  } catch (error) {
    console.error('Error in getComments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};


// exports.getAppSettings = async (req, res) => {
//   try {
//     let settings = await AppSettings.findOne();
//     if (!settings) {
//       settings = await AppSettings.create({});
//     }
//     res.json(settings);
//   } catch (error) {
//     console.error('Error in getAppSettings:', error);
//     res.status(500).json({ message: 'Error fetching app settings' });
//   }
// };

// exports.updateAppSettings = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const settings = await AppSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
//     res.json(settings);
//   } catch (error) {
//     console.error('Error in updateAppSettings:', error);
//     res.status(500).json({ message: 'Error updating app settings' });
//   }
// };

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({ message: 'Error fetching admin profile' });
  }
};

exports.updateAdminProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const admin = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Error in updateAdminProfile:', error);
    res.status(500).json({ message: 'Error updating admin profile' });
  }
};

exports.changeAdminPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await admin.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = req.body.newPassword;
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changeAdminPassword:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

// Added Blog Controller functions
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name')
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const blog = new Blog({
      title,
      content,
      tags: tags ? JSON.parse(tags) : [],
      author: req.user._id,
      picture: req.file ? `/uploads/${req.file.filename}` : null
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags ? JSON.parse(tags) : blog.tags;
    
    if (req.file) {
      blog.picture = `/uploads/${req.file.filename}`;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Error updating blog' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog' });
  }
};