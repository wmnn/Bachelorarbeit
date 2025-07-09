import { createFileRoute } from '@tanstack/react-router'
import { UpdateEmailForm } from '@/components/auth/forms/UpdateEmailForm';
import { DeleteUserForm } from '@/components/auth/forms/DeleteUserForm';
import { ChangeNameForm } from '@/components/auth/forms/ChangeNameForm';
import { ChangePasswordForm } from '@/components/auth/forms/ChangePasswordForm';
import { EditNachrichtenVorlagen } from '@/components/shared/Nachricht/EditNachrichtenVorlagen';
import { useContext, useState } from 'react';
import { ButtonLight } from '@/components/ButtonLight';
import { userContext } from '@/context/UserContext';
import { userHasPermission } from "@/components/auth/userHasPermission"
import { Berechtigung } from '@thesis/rollen';

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isEditVorlageDialogShown, setIsEditVorlagenDialogShown] = useState(false)
  const { user } = useContext(userContext)

  return <div className='w-full min-h-[100vh] p-4 xl:p-8'>

    {
        userHasPermission(user, Berechtigung.NachrichtenvorlagenVerwalten, true) && <>
      
        <h1>Nachrichtenvorlagen</h1>
        {
          isEditVorlageDialogShown && <EditNachrichtenVorlagen closeDialog={() => setIsEditVorlagenDialogShown(false)}/>
        }
        <ButtonLight onClick={() => setIsEditVorlagenDialogShown(true)}>
          Bearbeiten
        </ButtonLight>
      </>
    }
    
    
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
