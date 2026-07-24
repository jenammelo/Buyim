import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Buyim. - Admin",
    description: "Buyim. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
