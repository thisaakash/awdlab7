const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Student = require('./models/student');

const app = express();

mongoose.connect('mongodb://localhost:27017/university');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/students', (req, res) => {
    Student.find()
        .then(students => {
            res.render('student-list', { students });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while fetching students.' });
        });
});

app.post('/students', (req, res) => {
    const { rollno, name, "c-marks": cMarks, "python-marks": pythonMarks, "java-marks": javaMarks } = req.body;
    const student = new Student({ rollno, name, "c-marks": cMarks, "python-marks": pythonMarks, "java-marks": javaMarks });
    student.save()
        .then(() => {
            res.render('success', { msg: `The student ${name} was added successfully.` });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while saving the student.' });
        });
});

app.get('/compute-total-marks', (req, res) => {
    Student.updateMany(
        {},
        [{$set: {'total-marks': {$add: ['$c-marks', '$python-marks', '$java-marks']}}}])
        .then(() => {
            res.render('success', { msg: 'The total marks for all students have been updated successfully.' });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while computing total marks.' });
        });
});

app.get('/compute-percentage', (req, res) => {
    Student.updateMany(
        {},
        [{$set: {percentage: {$multiply: [{ $divide: ['$total-marks', 300] },100]}}}])
        .then(() => {
            res.render('success', { msg: 'The percentage for all students has been updated successfully.' });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while computing percentage.' });
        });
});

app.get('/delete-zero-marks', (req, res) => {
    Student.deleteMany({
        $and: [
            { "c-marks": 0 },
            { "python-marks": 0 },
            { "java-marks": 0 }
        ]
    })
        .then(() => {
            res.render('success', { msg: 'Documents with 0 marks in all subjects have been deleted successfully.' });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while deleting documents with 0 marks.' });
        });
});

app.get('/top-c-students', (req, res) => {
    Student.find().sort({ 'c-marks': -1 }).limit(3)
        .then(topCStudents => {
            res.render('top-c-students', { students: topCStudents });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while fetching top C students.' });
        });
});

app.get('/merit-list', (req, res) => {
    Student.find().sort({ 'total-marks': -1 })
        .then(meritList => {
            res.render('merit-list', { students: meritList });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while fetching merit list.' });
        });
});

app.get('/grace-marks-form', (req, res) => {
    res.render('grace-marks-form');
});

app.post('/apply-grace-marks', (req, res) => {
    const { graceMarks } = req.body;
    Student.updateMany({},{$inc: { 'java-marks': parseInt(graceMarks) }})
        .then(() => {
            res.render('success', { msg: `Successfully applied ${graceMarks} grace marks to all students in Java.` });
        })
        .catch(err => {
            console.error(err);
            res.render('error', { error: 'An error occurred while applying grace marks.' });
        });
});

app.get('/search-form', (req, res) => {
    res.render('search-form');
});

app.get('/search', async (req, res) => {
    const { rollno } = req.query;
    const result = await Student.findOne({ rollno });
    res.render('search-results', { student: result, rollno });
});

app.get('/top-students-form', (req, res) => {
    res.render('top-students-form');
});

app.get('/top-students', async (req, res) => {
    const { subject } = req.query;
    if (!['c-marks', 'python-marks', 'java-marks'].includes(subject)) {
        return res.status(400).send('Invalid subject selected.');
    }
    const topStudents = await Student.find().sort({ [subject]: -1 }).limit(3);
    res.render('top-students-results', { students: topStudents, subject });
});

app.get('/menu', (req, res) => {
    res.render('menu');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
