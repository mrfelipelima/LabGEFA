const { db } = require("../utils/admin");

exports.ScreamsRead = (req, res) => {
	db.collection("screams")
		.orderBy("createdAt", "desc")
		.get()
		.then((data) => {
			const screams = [];
			data.forEach((doc) => {
				screams.push({
					screamId: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
			});
			return res.json(screams);
		})
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
};

exports.ScreamsCreate = (req, res) => {
	const newScream = {
		createdAt: new Date().toISOString(),
		body: req.body.body,
		userHandle: req.user.handle
	};

	db.collection("screams")
		.add(newScream)
		.then((doc) => {
			const resScream = newScream;
			resScream.screamId = doc.id;
			res.json(resScream);
		})
		.catch((err) => {
			res.status(500).json({ errror: "something went wrong" });
			console.error(err);
		});
};
