import { createFileRoute, Link } from '@tanstack/react-router'
import { MainButton } from '@/components/MainButton'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex justify-center items-center flex-col h-[100vh] p-8 gap-8">

        <div className="max-w-[480px] w-full">
            <img src="DigiSchukumpk.png" className="w-full h-auto object-contain" />
        </div>
        

        <div className='flex gap-4'>
            <MainButton>
                <Link 
                    to='/login'
                    className='w-full h-full'                   
                >
                    Login
                </Link>
            </MainButton>

            <MainButton>
                <Link 
                    to='/register'
                    className='w-full h-full'    
                >
                    Registrierung
                </Link>
            </MainButton>
        </div>
        
    </div>
  )
}
