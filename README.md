# AI Backend Companion

AI Backend Companion is an HTTP server designed to streamline frontend fast prototyping and mocking. It allows you to send HTTP requests and automatically generates and executes handlers for those requests, making it easier to develop and test your frontend applications without the need for a fully functional backend server. With AI Backend Companion, you can quickly simulate backend behavior and responses for your frontend development.

## Installation

To get started, follow these simple installation steps:

1. Install the package via npm:

   ```bash
   npm i ai-backend-companion
   ```

2. Initialize AI Backend Companion in your code:

   ```javascript
   import {AiBackendCompanion} from 'ai-backend-companion';

   // Initialize AI Backend Companion with your API key
   const companion = new AIBackendCompanion({ apiKey: 'your-key' });

   // Start the companion server
   companion.start();
   ```

3. Alternatively, you can run AI Backend Companion using the following command (replace `'your-key'` with your actual API key):

   ```bash
   OPENAI_API_KEY=your-key npx ai-backend-companion
   ```

## Usage

Once AI Backend Companion is up and running, you can start using it to generate handlers for your HTTP requests. Here's how you can utilize this tool:

### Generating Handlers

To generate handlers for your HTTP requests, simply add the `doc_should` query parameter to your request. For example:

- **POST Request:**
    - URL: `http://localhost:8055/todo?doc_should=save a todo to db.json, creating it if it doesn't exist`
    - Request Body: `{"todo": "walk the dog"}`

By adding the `doc_should` query parameter, AI Backend Companion will automatically generate a handler for this request based on the provided description.

### Overwriting Generated Files

If you're not satisfied with the generated result or need to make changes, you can use the `doc_overwrite` query parameter to overwrite the generated files. This allows you to fine-tune the handlers as needed.

## Example

Here's an example of how you can use AI Backend Companion to generate a handler for a POST request:

```javascript
const fetch = require('node-fetch');

// Define the request URL with the 'doc_should' query parameter
const url = 'http://localhost:8055/todo?doc_should=save a todo to db.json, creating it if it doesn\'t exist';

// Define the request options, including the HTTP method and request body
const options = {
  method: 'POST',
  body: JSON.stringify({ todo: 'walk the dog' }),
  headers: {
    'Content-Type': 'application/json',
  },
};

// Send the request using the fetch library
fetch(url, options)
  .then(response => response.json())
  .then(data => {
    // Handle the response data as needed
    console.log('Response:', data);
  })
  .catch(error => {
    // Handle any errors that occur during the request
    console.error('Error:', error);
  });
```

With AI Backend Companion, you can quickly and easily prototype your frontend applications without the need for a fully developed backend server. This tool simplifies the process of generating request handlers, enabling efficient frontend development and testing.

For more information and options, you may [contact me](https://iammatan.com)


## All URL Parameters:
- doc_should - What should this request do
- doc_overwrite - should it always generate a backend file or should it use existing files
- doc_context - What is the overall context of what you're making
## License

This project is licensed under the MIT License.
