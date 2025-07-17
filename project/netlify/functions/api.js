// Use built-in fetch (available in Node 18+)

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { task_type, input_data } = JSON.parse(event.body);
    
    if (!task_type || !input_data) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing task_type or input_data' })
      };
    }

    // Use updated models
    let modelId;
    let apiUrl;
    
    switch (task_type) {
      case 'summarization':
        modelId = 'facebook/bart-large-cnn';
        apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
        break;
      case 'image':
        modelId = 'stabilityai/stable-diffusion-xl-base-1.0';
        apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
        break;
      default:
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Invalid task_type. Supported types: summarization, image' })
        };
    }

    const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
    
    if (!HUGGING_FACE_TOKEN || HUGGING_FACE_TOKEN === 'your_token_here') {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Hugging Face token not configured' })
      };
    }
    
    // Prepare request body based on task type
    let requestBody;
    if (task_type === 'summarization') {
      requestBody = JSON.stringify({
        inputs: input_data,
        parameters: {
          min_length: 30,
          max_length: 150
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      });
    } else if (task_type === 'image') {
      requestBody = JSON.stringify({
        inputs: input_data,
        options: {
          wait_for_model: true,
          use_cache: false
        }
      });
    }
    
    console.log(`Making request to: ${apiUrl}`);
    console.log(`Using model: ${modelId}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Neuraplay/1.0'
      },
      body: requestBody
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      if (response.status === 503) {
        try {
          const errorData = JSON.parse(errorText);
          return {
            statusCode: 503,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              error: 'Model is loading, please try again in a few moments',
              estimated_time: errorData.estimated_time || 20
            })
          };
        } catch (e) {
          return {
            statusCode: 503,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              error: 'Model is loading, please try again in a few moments'
            })
          };
        }
      }
      
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Rate limit exceeded, please try again later'
          })
        };
      }
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `API error: ${response.status} - ${errorText}`,
          details: errorText
        })
      };
    }

    // Handle different response types
    if (task_type === 'summarization') {
      const result = await response.json();
      console.log('Summarization result:', result);
      
      let processedResult;
      if (Array.isArray(result)) {
        processedResult = result;
      } else if (result.summary_text) {
        processedResult = [{ summary_text: result.summary_text }];
      } else {
        processedResult = [{ summary_text: "I'm here to help! Could you please provide some text to summarize?" }];
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedResult)
      };
      
    } else if (task_type === 'image') {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: base64,
          contentType: 'image/png'
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};