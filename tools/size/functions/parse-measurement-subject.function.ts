import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';
import type { MeasurementSubject } from '../interfaces/measurement-subject.interface.ts';

export function parseMeasurementSubject(name: string): MeasurementSubject | null {
  const head: string = name.split(': ')[0] ?? '';
  const match: RegExpExecArray | null = /^(core|ui|utils)(?:\/([a-z0-9-]+)| \(root\))?$/.exec(head);
  if (!match) return null;
  const packageFolder: FoundryPackageFolder = `foundry-${match[1] as 'core' | 'ui' | 'utils'}`;
  const packageName: string = `@antoniocorraliza/${packageFolder}`;
  return { packageFolder, specifier: match[2] === undefined ? packageName : `${packageName}/${match[2]}` };
}
