import PageContainer from "../components/layout/PageContainer";
import PageTitle from "../components/common/PageTitle";

const BookingLookupPage = () => {
    return (
        <PageContainer>


            <PageTitle

                title="My Bookings"

                subtitle="Search your bookings using your email."

            />


            <div className="bg-white rounded-xl shadow p-8">


                <p className="text-slate-600">

                    Booking search form will appear here.

                </p>


            </div>


        </PageContainer>
    );
};

export default BookingLookupPage;