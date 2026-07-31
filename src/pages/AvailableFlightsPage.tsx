import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";

const AvailableFlightsPage = () => {
    return (
        <PageContainer>

            <PageTitle
                title="Available Flights"
                subtitle="Flights currently open for booking."
            />


            <div className="bg-white rounded-xl shadow p-8">

                <p className="text-slate-600">

                    Available flights will appear here.

                </p>

            </div>


        </PageContainer>
    );
};

export default AvailableFlightsPage;