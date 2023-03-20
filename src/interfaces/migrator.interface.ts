export interface IMigrator<TOld, TNew> {
  get oldVersion(): string;
  get newVersion(): string;
  migrate(old: TOld): TNew;
}
