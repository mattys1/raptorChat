# Postawienie i Uruchomienie Aplikacji

## Wymagania
Do uruchomiania aplikacji potrzebne jest środowisko Linuxowe z zainstalowanym Dockerem i możliwością otwierania plików Appimage (co posiada większość dystrybucji). 

## Uruchamianie

Najpierw, należy uruchomić backend aplikacji. Aby to wykonać należy przejść do głównego folderu repozytorium i uruchomić skrypt `deploy_backend.sh`. Jeżeli skrypt działa jak należy, Docker powinien zainstalować odpowiednie kontenery i działający serwer powinien wypisać wiadomość:
```
backend-1  | 2025/05/28 10:22:46 Starting server on :8080...
``` 

Skryptowi można przekazać flagę `-d`, aby działał w tle.

Warto dodać, że jeżeli aplikacja uruchamiana jest na WSLu, skrypty `.sh` mogą mieć zepsute permisje oraz encoding. Jeżeli pojawi się jakiś błąd przy wykonaniu skryptu, można spróbować uruchomić komendy:
```
chmod +x ./deploy_backend.sh &&
dos2unix ./deploy_backend.sh
```

Do uruchomienia frontendu, należy, z poziomu głównego katalogu repozytorium, uruchomić komendy:
```
docker compose up --build frontend-build &&
frontend/dist/frontend-0.0.0.AppImage
```

Uruchomi to AppImage z frontendem aplikacji. AppImage można potem wykorzystywać z dowolnego katalogu, pod warunkiem, że serwer działa.
