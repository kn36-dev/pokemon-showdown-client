var Config = {
	server: {
		host: "localhost",
		port: 8000,
		id: "localhost",
	},
	// Add this section:
	routes: {
		client: "localhost:8000",
		dex: "https://dex.pokemonshowdown.com/",
		replays: "https://replay.pokemonshowdown.com/",
		users: "https://pokemonshowdown.com/users/",
	},
	resourceprefix: "http://localhost:8000/",
	//  resourceprefix: 'https://play.pokemonshowdown.com/',
	// Add this line to prevent the color-hash crash:
	customcolors: {},
	testclient: true,
};
