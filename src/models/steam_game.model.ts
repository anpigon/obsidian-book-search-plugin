export interface SteamResponse<T> {
  response: T;
}

export interface OwnedSteamGames {
  game_count: number;
  games: SteamGame[];
}

export interface SteamGame {
  appid: number;
  playtime_disconnected: number;
  playtime_forever: number;
  playtime_linux_forever: number;
  playtime_mac_forever: number;
  playtime_windows_forever: number;
  rtime_last_played: number;
}
