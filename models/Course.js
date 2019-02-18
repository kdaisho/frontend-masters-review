const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const courseSchema = new mongoose.Schema({
    course: {
        type: String,
        trim: true,
        required: 'Please enter a course title!'
    },
    instructor: {
        type: String,
        trim: true,
        required: 'Please enter an instructor name!'
    },
    url: {
        type: String,
        trim: true,
        required: 'Please enter URL!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    image: String
    // author: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: 'You must supply an author'
    // }
});

// Define our indexes
courseSchema.index({
    course: 'text',
    description: 'text'
});

courseSchema.pre('save', async function(next) {
    if (!this.isModified('course')) {
        next();
        return;
    }
    this.slug = slug(this.course);
    // Find other courses that have a slug of example, example-1, example-2
    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const coursesWithSlug = await this.constructor.find({ slug: slugRegExp });
    if (coursesWithSlug.length) {
        this.slug = `${this.slug}-${coursesWithSlug.length + 1}`;
    }
    next();
    // TODO make more resiliant so slugs are unique
});

courseSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } }},
        { $sort: { count: -1 }}
    ]);
}
module.exports = mongoose.model('Course', courseSchema);