import { MedplumLink, useMedplum } from '@medplum/react';
import React from 'react';
import { getProjectId } from '../utils';
import { MemberTable } from './MembersTable';

export function BotsPage(): JSX.Element {
  const medplum = useMedplum();
  const projectId = getProjectId(medplum);
  const result = medplum.get(`admin/projects/${projectId}`).read();

  return (
    <>
      <h1>Bots</h1>
      <MemberTable members={result.members.filter((member: any) => member.role === 'bot')} />
      <div className="medplum-right">
        <MedplumLink to={`/admin/bots/new`}>Create new bot</MedplumLink>
      </div>
    </>
  );
}
