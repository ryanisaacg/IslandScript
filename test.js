function test () {
	if (true) {
		function doTest () {
			console.log("This should log numbers from 1 to 10.")
			for (var i = 0;i < 10;i++) {
				console.log(i)
				i += 1
				
		}
	}
		return doTest
}
}
test()()
console.log("Some testing")
