import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs";

const CreateEvent = () => {
  const { sessionClaims } = auth();
  // const userId = sessionClaims?.userId as string;
  const { userId } = auth();
  console.log("id",userId)
  const userid=localStorage.getItem("userId")
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
      </section>


      <div className="wrapper my-8">
        <EventForm userId={userid} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
