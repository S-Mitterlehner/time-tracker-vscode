import { MigrationManager as MigratorManager } from './factories/factory.migrator';
import { IFileManager } from './interfaces/file-manager.interface';
import { IInteractionService } from './interfaces/interaction-service.interface';
import { CompositeMigrator } from './migrators/composite.migrator';
import { V1ToV2Migrator } from './migrators/v1-to-v2.migrator';
import { V2ToV3Migrator } from './migrators/v2-to-v3.migrator';

export function createMigratorManager(fileManager: IFileManager, interaction: IInteractionService) {
  const migrators = [];
  const v1ToV2 = new V1ToV2Migrator();
  const v2ToV3 = new V2ToV3Migrator();

  migrators.push(v1ToV2);
  migrators.push(v2ToV3);
  migrators.push(new CompositeMigrator('1', '3', [v1ToV2, v2ToV3]));

  return new MigratorManager(fileManager, interaction, ...migrators);
}
