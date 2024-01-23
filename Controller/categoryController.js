const {Categories} = require('../Model/categoryModel.js');

const getCategories = async (req,res,next) => {
    try {
        const data = await Categories.find({});

        return res.status(200).json({success:true,message:'Category fetched succesfully',data})
    } catch (error) {
        next(error);
    }
}

const addCategory = async (req, res, next) => {
    try {
        const { name, skills } = req.body;
        const existingCategory = await Categories.findOne({ name });
        if (existingCategory) throw {status:400,message:'Category already exsist'}
        const uniqueSkills = [...new Set(skills)].map(sk=>sk.toUpperCase());
        const newCategory = new Categories({ name:name.toUpperCase(), skills:uniqueSkills || [] });
        await newCategory.save();
        return res.status(201).json({ success: true, message: 'Category added successfully', data: newCategory });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name, skills } = req.body;

        // Check if the category with given ID exists
        const existingCategory = await Categories.findById(categoryId);
        if (!existingCategory) throw {status:404,message:'Category not found'}
        // Check if the new name is not already taken by another category
        if (name && name.toUpperCase() !== existingCategory.name) {
            const existingCategoryWithName = await Categories.findOne({ name:name.toUpperCase() });
            if (existingCategoryWithName) throw { status: 400, message: 'Category with the given name already exists' }
            
        }
        if (skills && Array.isArray(skills)) {
            const uniqueSkills = skills.reduce((unique, skill) => {
                // console.log(skill)
                const normalizedSkill = { value: skill?.value?.toUpperCase(), label: skill?.label?.toUpperCase() };
                if (!unique.find(existing => existing.value === normalizedSkill.value && existing.label === normalizedSkill.label)) {
                    unique.push(normalizedSkill);
                }
                return unique;
            }, []);

            existingCategory.skills = uniqueSkills;
        }
        // Update the category
        existingCategory.name = name?.toUpperCase() || existingCategory.name;
        await existingCategory.save();

        return res.status(200).json({ success: true, message: 'Category updated successfully', data: existingCategory });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    getCategories,
    addCategory,
    updateCategory
}