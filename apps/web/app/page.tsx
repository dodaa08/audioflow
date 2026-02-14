import Landing from "./(pages)/Landing";
import { Toaster } from 'react-hot-toast';

const Home = () => {
  return (
    <>
    <div>
      <Toaster />
      <Landing />
    </div>
    </>
  )
};

export default Home;