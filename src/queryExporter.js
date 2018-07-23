const queryAs = (service, appId, query, variables) => {
  switch (service) {
    case 'cURL':
      const payload = {query: query, variables: JSON.parse(variables)};
      return `curl 'https://serve.onegraph.io/dynamic?app_id=${appId}' -H 'Accept: application/json' -H 'Authentication: Bearer <your-auth-token>' -H 'Content-Type: application/json' --data-binary '${JSON.stringify(
        payload,
      )}' --compressed`;
    case 'clj-http':
      const queryEscaped = query.replace(/"/g, '\\"');
      const variablesEscaped = variables.replace(/"/g, '\\"');
      return `
(let [variables (json/parse-string "${variablesEscaped}")
      query "${queryEscaped}"
      body (json/generate-string {:query query :variables variables})]
(clj-http.client/post
  "https://serve.onegraph.io/dynamic"
  {:headers
   {"Accept" "application/json",
    "Referer" "http://localhost:3001/",
    "Origin" "http://localhost:3001",
    "Authentication" "Bearer <your-auth-token>",
    "User-Agent" "your-email-here-in-case-we-need-to-contact-you",
    "Content-Type" "application/json"},
   :body body,
   :as :json
   :query-params {"app_id" "${appId}"}}))`;
    default:
      return 'unrecognized service';
  }
};

export {queryAs};
