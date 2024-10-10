import { PreferenceRepository, WritablePreference } from "./PreferenceRepository.js";

export class PreferenceService {
  private pref_repo: PreferenceRepository;
  constructor(pref_repo: PreferenceRepository) {
    this.pref_repo = pref_repo;
  }

  async getUserPreference(user_id: number) {
    return await this.pref_repo.getUserPreference(user_id);
  }

  async saveUserPreference(user_id: number, pref: WritablePreference) {
    return await this.pref_repo.saveUserPreference(user_id, pref);
  }
}
