import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";

const FlightsPage = () => {
    return (
        <PageContainer>

            <PageTitle
                title="All Flights"
                subtitle="Browse all available flights from our system."
            />


            <div className="bg-white rounded-xl shadow p-8">

                <p className="text-slate-600">
                    Flight list will appear here.
                </p>

            </div>

        </PageContainer>
    );
};

export default FlightsPage;