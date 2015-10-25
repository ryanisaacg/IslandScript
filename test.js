function test () {
	if (true) {
		function doTest () {
			console.log("This should log.")
		}
		return doTest
}
}
test.doTest()

