import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import { PreferenceRepository, WritablePreference } from "./PreferenceRepository.js";

export function preferenceServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const preference_repo = new PreferenceRepository(db);
  const preference_service = new PreferenceService(preference_repo, transaction_manager);
  return preference_service;
}

export class PreferenceService implements Transactable<PreferenceService> {
  private pref_repo: PreferenceRepository;
  private transaction_manager: TransactionManager;
  constructor(pref_repo: PreferenceRepository, transaction_manager: TransactionManager) {
    this.pref_repo = pref_repo;
    this.transaction_manager = transaction_manager;
  }

  factory = preferenceServiceFactory;

  async getUserPreference(user_id: number) {
    return await this.transaction_manager.transaction(this as PreferenceService, async (serv) => {
      return await serv.pref_repo.getUserPreference(user_id);
    });
  }

  async saveUserPreference(user_id: number, pref: WritablePreference) {
    return await this.transaction_manager.transaction(this as PreferenceService, async (serv) => {
      return await serv.pref_repo.saveUserPreference(user_id, pref);
    });
  }
}
