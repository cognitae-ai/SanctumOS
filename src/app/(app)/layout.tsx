import { Sidebar } from '@/components/sidebar/Sidebar';
import { SplitLayout } from '@/components/layout/SplitLayout';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SplitLayout sidebar={<Sidebar />}>
            {children}
        </SplitLayout>
    );
}
