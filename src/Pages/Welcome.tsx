
import GuestLayout from '@/Layout/GuestLayout';
import Charity from '@/Components/Charity';
import Hero from '@/Components/Hero';

export default function Welcome() {
    return (
       <GuestLayout>
            <Hero />
            <Charity/>
       
       </GuestLayout>
    )
}
