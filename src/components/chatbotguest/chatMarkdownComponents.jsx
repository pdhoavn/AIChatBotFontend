// Shared ReactMarkdown overrides for chatbot guest UI
export const chatMarkdownComponents = {
  a: ({ node, children, ...props }) => (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
};
