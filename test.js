function test () {
	if (true) {
		function doTest () {
			console.log("This should log numbers from 1 to 10.")
			var i = 1
			while (i <= 10) {
				console.log(i)
				i += 1
		}
	}
		return doTest
}
}
test()()
