import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Buyim. - Store Dashboard",
    description: "Buyim. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
