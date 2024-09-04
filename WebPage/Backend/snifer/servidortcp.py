import socket
import requests
from datetime import datetime, timezone, timedelta

# Configuración del sniffer TCP
TCP_IP = '0.0.0.0'
TCP_PORT = 41000

# Configuración del backend de FastAPI
FASTAPI_URL = "http://127.0.0.1:8000/receive_data"

def start_sniffer():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((TCP_IP, TCP_PORT))
    s.listen(1)

    print("Esperando conexión...")

    try:
        while True:
            conn, addr = s.accept()
            print(f"Conexión desde: {addr}")
            
            try:
                while True:
                    data = conn.recv(4096).decode()  # Aumentar el tamaño del buffer si es necesario
                    if not data:
                        break  # Salir del bucle si no hay más datos

                    # Procesar datos en caso de que haya múltiples líneas de datos
                    for line in data.splitlines():
                        # Asumiendo que los datos están en formato: "latitud,longitud,time"
                        try:
                            latitud, longitud, time_str = line.split(",")
                            time = int(time_str)
                            
                            # Convertir el timestamp a un objeto datetime en UTC
                            utc_time = datetime.fromtimestamp(time / 1000, tz=timezone.utc)
                            
                            # Convertir la hora UTC a la hora en Bogotá (GMT-5)
                            bogota_tz = timezone(timedelta(hours=-5))
                            bogota_time = utc_time.astimezone(bogota_tz)
                            
                            # Obtener el día y la hora en la zona horaria de Bogotá
                            dia = bogota_time.date().isoformat()  # Convertir a formato de cadena ISO
                            hora = bogota_time.time().isoformat()  # Convertir a formato de cadena ISO
                            
                            # Enviar datos al backend de FastAPI
                            try:
                                response = requests.post(FASTAPI_URL, json={
                                    "latitud": latitud,
                                    "longitud": longitud,
                                    "dia": dia,
                                    "hora": hora
                                })
                                response.raise_for_status()  # Lanza un error para códigos de respuesta HTTP 4xx/5xx
                                print(f"Datos enviados con éxito: {response.json()}")
                            except requests.ConnectionError as e:
                                print(f"Error en la conexión: {e}")
                            except requests.RequestException as e:
                                print(f"Error en la solicitud: {e}")
                        
                        except ValueError as e:
                            print(f"Error al procesar los datos: {e}")

            except (ConnectionResetError, BrokenPipeError):
                print("La conexión fue cerrada inesperadamente.")
            finally:
                conn.close()
                print("Conexión cerrada.")

    except KeyboardInterrupt:
        print("Interrupción del usuario. Cerrando servidor...")
    finally:
        s.close()

if __name__ == "__main__":
    start_sniffer()

