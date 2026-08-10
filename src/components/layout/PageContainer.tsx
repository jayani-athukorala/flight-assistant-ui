import type { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
}

const PageContainer = ({ children, }: PageContainerProps) => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
        </div>
    );
};

export default PageContainer;