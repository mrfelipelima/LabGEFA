const {admin, db} = require("./admin");

module.exports = (req, res, next) => {
	let idToken;
	if (
		req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
	) {
		idToken = req.headers.authorization.split("Bearer ")[1];
	} else {
		console.error("No token found");
		return res.status(403).json({error: "Unauthorized"});
	}
	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedToken) => {
			req.user = decodedToken;
			console.log(decodedToken);
			return db
				.collection("userProfile")
				.where("userId", "==", req.user.uid)
				.limit(1)
				.get();
		})
		.then((data) => {
			req.user.handle = data.docs[0].data().username;
			return next();
		})
		.catch((err) => {
			console.error("Erro ao verificar token", err);
			return res.status(403).json(err);
		});
};
