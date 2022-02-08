const {Category} = require('../models/category');
const express = require("express");
const router = express.Router();

// @desc        Get all categories
// @route       GET/api/v1/categories
// @access      public
router.get(`/`,async(req,res)=>{
    const categoryList = await Category.find( );

    if(!categoryList){
        res.status(500).json({success: false});
    }
      res.status(200).send(categoryList);
  })

  // @desc        Get a single categories by id
// @route       GET/api/v1/categories/:id
// @access      public
  router.get('/:id', async(req, res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({success: false, message: "The category with given id is not found"});
    }
    res.status(200).send(category);
  })
  
  // @desc        Create  a category
// @route       POST/api/v1/categories
// @access      private
  router.post('/', async(req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon:  req.body.icon,
        color: req.body.color,
    })
    category= await category.save();
    if(!category)
    return res.status(404).send('The category cannot be created!');
    res.send(category);
  })

// @desc        Update a category by id 
// @route       PUT/api/v1/categories/:id
// @access      private
router.put('/:id', async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },{new: true}
    )
    if(!category)
    return res.status(404).send('The category cannot be created!');
    res.send(category);
})

 // @desc        Delete a category by id
// @route       DELETE/api/v1/categories/:id
// @access      private 
router.delete('/:id',(req, res)=>{
    Category.findByIdAndDelete(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({success: true, message: "The category is deleted "});
        }else{
            return res.status(404).json({success: false, message: "Category not found"});
        }
    }).catch(err =>{
        return res.status(400).json({success: false, error: err});
    })
})

  module.exports = router;