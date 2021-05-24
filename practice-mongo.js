const mongoose = require('mongoose');

// db connection
const connect = () => {
  const MONGO_URI = 'mongodb://localhost:27017/practice';
  return mongoose.connect(MONGO_URI);
};

// schema
const student = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
    },
    info: {
      school: {
        type: String,
      },
      shoeSize: {
        type: Number,
      },
      favFoods: [{ type: String }], // Array of Strings
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'school',
    },
  },
  {
    timestamps: true, // done by mongoose
  }
);

const school = new mongoose.Schema({
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'district',
  },
  name: String,
  openSince: Number,
  students: Number,
  isGreat: Boolean,
  staff: [{ type: String }],
});

school.index(
  {
    district: 1, // first should be which can change more
    name: 1,
  },
  { unique: true }
);

school.pre('save', function () {
  console.log('In save!');
});

school.post('save', function (doc, next) {
  setTimeout(() => {
    console.log('after save!', doc);
    next();
  }, 1000);
});

school.virtual('staffCount').get(function () {
  // here arrow function can't be used as we need to refer to the school instance here

  return this.staff.length;
});

// model
// name: lowercase && singular
const Student = mongoose.model('student', student);
const School = mongoose.model('school', school);

// Queries
connect()
  .then(async connection => {
    // // Create
    // const student = await Student.create({ firstName: "Hasham" })
    // console.log(student) // mongoose document

    // // Read
    // const found = await Student.find({ firstName: "Hasham" })
    // const foundById = await Student.findById("someIdHere")

    // // update
    // const updated = await Student.findByIdAndUpdate("someId", {})

    // multi queries
    // const school = await School.create({ name: 'some school' });

    // findAndUpdate or create a new one
    const schoolConfig = {
      name: 'some school',
      openSince: 2009,
      students: 1000,
      isGreat: true,
      staff: ['a', 'b', 'f'],
    };

    const school2 = {
      name: 'some school 2',
      openSince: 1980,
      students: 600,
      isGreat: false,
      staff: ['v', 'b', 'q'],
    };

    const schools = await School.create([schoolConfig, school2]);

    const match = await School.find({
      // students: { $gt: 600, $lt: 800 },
      // isGreat: true,
      // staff: 'b', // will search inside the array
      staff: { $in: ['b', 'a'] },
    })
      .sort({ openSince: 1 }) // sort ascending
      .limit(2)
      .exec();
    console.log(match);

    // const school = await School.findOneAndUpdate(
    //   { name: 'some school' },
    //   { name: 'some school' },
    //   {
    //     upsert: true,
    //     new: true,
    //   }
    // ).exec();
    // const student = await Student.create({
    //   firstName: 'James',
    //   school: school._id, // reference to the school
    // });

    // const match = await Student.findById(student.id).populate('school').exec();
    // console.log(match);
  })
  .catch(e => console.error(e));
