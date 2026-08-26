// This layout intentionally overrides the parent workspace layout.
// DAS1 (chat) has NO sidebar, NO companion panel — pure standalone page.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
