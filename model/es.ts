import { Client } from "npm:@elastic/elasticsearch";

// Sample data books
const dataset = [
    { "name": "Snow Crash", "author": "Neal Stephenson", "release_date": "1992-06-01", "page_count": 470 },
    { "name": "Revelation Space", "author": "Alastair Reynolds", "release_date": "2000-03-15", "page_count": 585 },
    { "name": "1984", "author": "George Orwell", "release_date": "1985-06-01", "page_count": 328 },
    { "name": "Fahrenheit 451", "author": "Ray Bradbury", "release_date": "1953-10-15", "page_count": 227 },
    { "name": "Brave New Snow World", "author": "Aldous Huxley", "release_date": "1932-06-01", "page_count": 268 },
    { "name": "The Handmaid's Tale", "author": "Margaret Atwood", "release_date": "1985-06-01", "page_count": 311 },
];

async function connectES() {
    try {
        const client = new Client({
            node: 'https://b1353349e7dd472baeffd4e64d1ecb0d.us-central1.gcp.cloud.es.io',
            auth: {
                apiKey: {
                    id: "xIZcqY8Bo0qdolqZxIOR",
                    api_key: "loHvss3_SRWK27_rwF_0LA",
                }
            }
        });

        // API Key should have cluster monitor rights.
        const resp = await client.info();
        // console.log(resp);

        // Check index exists
        const isExist = await client.indices.exists({ index: 'books' });
        if (!isExist) {
            const result1 = await client.indices.create({ index: 'books' });

            console.log(result1);

            for (const doc of dataset) {
                const result = await client.index({
                    index: 'books',
                    document: doc
                });
                console.log(`Indexed document ID: ${result._id}`, result);
            }
        }

        // Let's search!
        const searchResult = await client.search({
            index: 'books',
            //q: 'snow', // Query string
            size: 10, // Get top 10 posts
            sort: [{ "trendingScore": "desc" }] // sort by page_count descending
        });

        console.log(searchResult.hits.hits)

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

connectES();