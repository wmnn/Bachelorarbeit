import { createFileRoute } from '@tanstack/react-router'
import { UpdateEmailForm } from '@/components/auth/forms/UpdateEmailForm';
import { DeleteUserForm } from '@/components/auth/forms/DeleteUserForm';
import { ChangeNameForm } from '@/components/auth/forms/ChangeNameForm';
import { ChangePasswordForm } from '@/components/auth/forms/ChangePasswordForm';

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {

  return <div className='w-full min-h-[100vh] p-4 xl:p-8'>

    <h1>Konto bearbeiten</h1>
    <ChangeNameForm />
    <div className='bg-gray-200 h-[1px] my-8'/>
    <UpdateEmailForm />
    <div className='bg-gray-200 h-[1px] my-8'/>
    <ChangePasswordForm />
    <div className='bg-gray-200 h-[1px] my-8'/>
    <DeleteUserForm />
    
  </div>
}
