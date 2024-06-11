from aifc import Error
from datetime import datetime

from flask import Flask, jsonify, send_file, request
import mysql.connector

app = Flask(__name__)

host = 'localhost'
port = 3307
dbname = 'football_stats'
username = 'root'
password = 'mipass'


def get_connection():
    conn = mysql.connector.connect(
        host=host,
        port=port,
        user=username,
        password=password,
        database=dbname
    )
    return conn


@app.get('/api/ranking/rank_date')
def get_ranking_dates():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT DISTINCT rank_date FROM rankings;')
    dates = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(dates)


@app.route('/generar_ranking.html')
def generate():
    return send_file('templates/index.html')


@app.route('/')
def home():
    return send_file('templates/home.html')


@app.route('/jugadores.html')
def jugadores():
    return send_file('templates/jugadores.html')


@app.route('/players.html')
def players():
    return send_file('templates/players.html')


@app.route('/navbar.html')
def navbar():
    return send_file('templates/navbar.html')


@app.route('/ranking.html')
def ranking():
    return send_file('templates/ranking.html')


@app.route('/about.html')
def about():
    return send_file('templates/about.html')


@app.route('/simulador.html')
def simulador():
    return send_file('templates/simulador.html')


@app.get('/api/ranking')
def get_ranking():
    conn = get_connection()
    cur = conn.cursor()
    query = """
    SELECT
            r.rank,
            c.country_id,
            c.country_full,
            c.country_abrv,
            r.total_points,
            r.previous_points,
            r.rank_change,
            c.confederation,
            r.rank_date,
            r.jugadores_plantilla,
            r.jugadores_extranjeros,
            r.jugadores_nacionales,
            r.edad_promedio,
            r.altura_promedio,
            r.valor_total,
            c.economy,
            c.climate,
            c.pib,
            c.democracy_index
        FROM
            rankingsabril r
        JOIN
            countries c ON r.country_id = c.country_id
        WHERE
            r.rank_date = '2024-04-04'
        """
    cur.execute(query)

    ranking = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(ranking)


# Get ranking by date
@app.route('/api/ranking/<string:date>', methods=['GET'])
def get_ranking_by_date(date):
    connection = get_connection()
    if connection is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

    try:
        cursor = connection.cursor()
        query = """
        SELECT
            r.rank,
            c.country_id,
            c.country_full,
            c.country_abrv,
            r.total_points,
            r.previous_points,
            r.rank_change,
            c.confederation,
            r.rank_date,
            r.jugadores_plantilla,
            r.jugadores_extranjeros,
            r.jugadores_nacionales,
            r.edad_promedio,
            r.altura_promedio,
            r.valor_total,
            c.economy,
            c.climate,
            c.pib,
            c.democracy_index
        FROM
            rankings r
        JOIN
            countries c ON r.country_id = c.country_id
        WHERE
            r.rank_date = %s
            ORDER BY r.rank;;
        """
        cursor.execute(query, (date,))
        ranking = cursor.fetchall()
        cursor.close()
        connection.close()

        # Verificar la estructura de los datos obtenidos
        print(f"Ranking Data: {ranking}")

        return jsonify(ranking)
    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.get('/api/ranking/<int:id>')
def get_rank(id):
    print(id)
    conn = get_connection()
    cur = conn.cursor()  # Usar dictionary=True para obtener los resultados como diccionarios
    cur.execute(
        'SELECT nombre, posicion, fecha_nacimiento, edad, club, altura, pie, partidos_seleccion,goles, debut, valor_mercado, player_id from players WHERE country_id = %s',
        (id,))
    players = cur.fetchall()
    cur.close()
    conn.close()

    if not players:
        return jsonify({'Message': 'Rank not found'}), 404

    return jsonify(players)


@app.get('/api/rankingsab/<int:id>')
def get_ranks(id):
    print(id)
    conn = get_connection()
    cur = conn.cursor()  # Usar dictionary=True para obtener los resultados como diccionarios
    cur.execute(
        'SELECT nombre, posicion, fecha_nacimiento, edad, club, altura, pie, partidos_seleccion,goles, debut, valor_mercado, player_id from playersabril WHERE country_id = %s',
        (id,))
    players = cur.fetchall()
    cur.close()
    conn.close()

    if not players:
        return jsonify({'Message': 'Rank not found'}), 404

    return jsonify(players)


@app.get('/api/ranking/countries')
def get_countries():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT country_id, country_full FROM countries;')
    countries = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(countries)


# Get country name by id
@app.route('/api/ranking/countries/<int:id>', methods=['GET'])
def get_country_name_by_id(id):
    connection = get_connection()
    if connection is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

    try:
        cursor = connection.cursor()
        query = """
        SELECT
            country_full
        FROM
            countries
        WHERE
            country_id = %s;
        """
        cursor.execute(query, (id,))
        country = cursor.fetchall()
        cursor.close()
        connection.close()

        # Verificar la estructura de los datos obtenidos
        print(f"Country Data: {country}")

        return jsonify(country)
    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.post('/api/ranking/update')
def generate_new_ranking():
    conn = get_connection()
    new_ranking = request.get_json()
    print(new_ranking)
    new_date = None

    # Recorremos los elementos del diccionario
    for item in new_ranking:
        if 'fechaRanking' in item:
            new_date = item['fechaRanking']
            break
    print(f"New ranking aqui: {new_ranking}")

    # Remover la fecha del ranking del diccionario
    new_ranking = [item for item in new_ranking if 'fechaRanking' not in item]
    print(f"New ranking aqui ya sin: {new_ranking}")

    print(f"Fecha del ranking: {new_date}")
    cur = conn.cursor()
    cur.execute(
        '''select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, edad_promedio, valor_total from rankings;''')
    current_ranking = cur.fetchall()
    print(current_ranking)

    updated_ranking = []
    for rank in current_ranking:
        country_id = rank[1]
        current_points = rank[3]
        updated_rank = list(rank)
        for update in new_ranking:
            if update['countryId'] == str(country_id):
                updated_rank[2] = float(update['new_totalPoints'])  # Actualizando `total_points`
                updated_rank[3] = current_points  # Actualizando `previous_points`
                break
        updated_rank[5] = new_date  # Actualizando `rank_date` para todos los registros
        updated_ranking.append(updated_rank)
    print(f"Ranking actualizado: {updated_ranking}")
    rankingNuevo = recalculate_ranking(updated_ranking)

    print(f"Ranking nuevo: {rankingNuevo}")
    save_ranking(rankingNuevo)
    cur.close()
    conn.close()
    return jsonify({'Message': 'Ranking updated successfully'})


def recalculate_ranking(updated_ranking):
    # Ordenar por los nuevos puntos totales en orden descendente
    updated_ranking.sort(key=lambda x: x[2], reverse=True)
    # Recalcular el rango y el cambio de rango
    new_ranking = []
    for index, rank in enumerate(updated_ranking):
        previous_rank = rank[0]
        new_rank = index + 1
        rank_change = previous_rank - new_rank
        new_rank_entry = rank[:]
        new_rank_entry[0] = new_rank  # Actualizando el rank
        new_rank_entry[4] = rank_change  # Actualizando el cambio de rank
        new_ranking.append(new_rank_entry)
    return new_ranking


def get_newranking():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        '''select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, edad_promedio, valor_total from rankings;''')
    current_ranking = cur.fetchall()
    print(current_ranking)

    updated_ranking = []
    # for rank in current_ranking:
    #     country_id = rank[1]
    #     current_points = rank[3]
    #     updated_rank = list(rank)
    #     for update in new_ranking:
    #         if update['countryId'] == str(country_id):
    #             updated_rank[2] = float(update['new_totalPoints'])  # Actualizando `total_points`
    #             updated_rank[3] = current_points  # Actualizando `previous_points`
    #             break
    #     updated_rank[5] = new_date  # Actualizando `rank_date` para todos los registros
    #     updated_ranking.append(updated_rank)
    print(f"Ranking actualizado: {updated_ranking}")
    rankingNuevo = recalculate_ranking(updated_ranking)

    print(f"Ranking nuevo: {rankingNuevo}")
    save_ranking(rankingNuevo)
    cur.close()
    conn.close()
    return jsonify({'Message': 'Ranking updated successfully'})


def save_ranking(new_ranking):
    conn = get_connection()
    cur = conn.cursor()
    # Extraer la fecha del ranking actualizado
    new_date = new_ranking[0][5]
    print(f"Fecha del ranking actualizado: {new_date}")

    cur.execute('DELETE FROM rankings')
    conn.commit()
    cur.executemany(
        '''INSERT INTO rankings(`rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, jugadores_extranjeros, jugadores_nacionales, edad_promedio,altura_promedio, valor_total) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);''',
        new_ranking)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'Message': 'Ranking updated successfully'})


@app.put('/api/ranking/countries/<int:id>')
def update_jugador(id):
    conn = get_connection()
    cur = conn.cursor()
    jugador = request.get_json()
    countryId = id
    newDate = datetime.now().strftime('%Y-%m-%d')
    print(f"Country ID: {countryId}")
    print(f"Jugador: {jugador}")
    cur.execute('SELECT DISTINCT rank_date FROM rankings ORDER BY rank_date;')
    dates = cur.fetchall()
    latest_date = dates[-1][0] if dates else None
    print(f"Latest Rank Date: {latest_date}")
    # Get ranking list
    query = """
            select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, jugadores_extranjeros, jugadores_nacionales, edad_promedio, altura_promedio, valor_total from rankings where rank_date = %s;
            """
    cur.execute(query, (latest_date,))
    rankingactual1 = cur.fetchall()
    print(f"Ranking actual antes de modficar: {rankingactual1}")

    cur.execute('SELECT total_points, altura_promedio, valor_total FROM rankings WHERE country_id = %s;', (countryId,))
    player = cur.fetchall()
    player_points = player[0][0]
    player_altura = player[0][1]
    player_valor = player[0][2]
    print(f"Selection points: {player_points} - Selection altura: {player_altura} - Selection Valor: {player_valor}")
    try:
        for item in jugador:
            print(f"Item: {item}")
            playerId = item['playerId']
            newAltura = float(item['newAltura'])
            newValor = float(item['newValorMercado'])
            print(f"CountryId: {countryId} - Player ID: {playerId} - Altura: {newAltura} - Valor: {newValor}")
            cur.execute('update players set altura = %s, valor_mercado = %s where player_id = %s and country_id = %s;',
                        (newAltura, newValor, playerId, countryId))
            # Confirmar la transacción
            conn.commit()

        cur.execute('SELECT total_points, altura_promedio, valor_total FROM rankings WHERE country_id = %s;',
                    (countryId,))

        playerUpdated = cur.fetchall()
        player_points_updated = playerUpdated[0][0]
        player_altura_updated = playerUpdated[0][1]
        player_valor_updated = playerUpdated[0][2]
        print(
            f"Updated points: {player_points_updated} - Updated altura: {player_altura_updated} - Updated Valor: {player_valor_updated}")

        query1 = """
                    select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, jugadores_extranjeros, jugadores_nacionales, edad_promedio, altura_promedio, valor_total from rankings where rank_date = %s;
                    """
        cur.execute(query1, (latest_date,))
        rankingactual = cur.fetchall()
        print(f"rankings: {rankingactual}")

        updated_ranking = []

        for rank in rankingactual:
            rank_country_id = rank[1]
            updated_rank = list(rank)

            # Actualizar la fecha del ranking para todos
            updated_rank[5] = newDate

            if rank_country_id == countryId:
                # Comparar valores actualizados con los valores previos y actualizar puntos si es necesario
                new_player_points = updated_rank[2]
                print(f"Actualizando puntos para el país ID {countryId}:")
                print(f"Altura previa: {player_altura}, Altura actualizada: {player_altura_updated}")
                print(f"Valor previo: {player_valor}, Valor actualizado: {player_valor_updated}")

                if player_altura_updated > player_altura:
                    new_player_points += 10
                    print(f"Se suman 10 puntos por altura. Nuevos puntos: {new_player_points}")
                elif player_altura_updated < player_altura:
                    new_player_points -= 10
                    print(f"Se restan 10 puntos por altura. Nuevos puntos: {new_player_points}")

                if player_valor_updated > player_valor:
                    new_player_points += 10
                    print(f"Se suman 10 puntos por valor. Nuevos puntos: {new_player_points}")
                elif player_valor_updated < player_valor:
                    new_player_points -= 10
                    print(f"Se restan 10 puntos por valor. Nuevos puntos: {new_player_points}")

                updated_rank[2] = new_player_points  # Actualizar total_points

            updated_ranking.append(updated_rank)

        print(f"Ranking Actualizado: {updated_ranking}")
        rankingOrdenado = calculate_ranking(updated_ranking)
        print(f"Ranking Ordenado: {rankingOrdenado}")
        save_ranking(rankingOrdenado)

    except Exception as e:
        # Imprimir el error y hacer rollback si hay un error
        print(f"Error al actualizar el jugador: {e}")
        conn.rollback()
        return jsonify({'Error': str(e)}), 500

    finally:
        # Cerrar el cursor y la conexión
        cur.close()
        conn.close()

    return jsonify({'Message': 'Player updated successfully'})


# Ordenar la lista actualizada por los puntos totales en forma descendente
def calculate_ranking(updated_ranking):
    # Ordenar el ranking actualizado en función de los puntos totales (índice 2), en orden descendente
    updated_ranking.sort(key=lambda x: x[2], reverse=True)

    # Recalcular el rango y el cambio de rango
    new_ranking = []
    for index, rank in enumerate(updated_ranking):
        previous_rank = rank[0]
        new_rank = index + 1
        rank_change = previous_rank - new_rank

        # Crear una nueva entrada para el ranking actualizado
        new_rank_entry = rank[:]
        new_rank_entry[0] = new_rank  # Actualizando el rank
        new_rank_entry[4] = rank_change  # Actualizando el cambio de rank

        new_ranking.append(new_rank_entry)

    return new_ranking


@app.put('/api/ranking/update/<int:id>')
def update_rank(id):
    conn = get_connection()
    cur = conn.cursor()
    rank = request.get_json()
    newDate = datetime.now().strftime('%Y-%m-%d')
    print(rank)
    rankId = id
    jugadoresExtranjeros = rank['extNumber']
    jugadoresNacionales = rank['jugadoresNac']

    cur.execute('SELECT DISTINCT rank_date FROM rankings ORDER BY rank_date;')
    dates = cur.fetchall()
    latest_date = dates[-1][0] if dates else None
    print(f"Latest Rank Date: {latest_date}")
    # Get ranking list
    query = """
                select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, jugadores_extranjeros, jugadores_nacionales, edad_promedio, altura_promedio, valor_total from rankings where rank_date = %s;
                """
    cur.execute(query, (latest_date,))
    rankingactual1 = cur.fetchall()
    print(f"Ranking actual antes de modficar: {rankingactual1}")

    cur.execute('SELECT jugadores_extranjeros, jugadores_nacionales FROM rankings WHERE `rank` = %s;', (rankId,))
    player = cur.fetchall()
    player_ext = player[0][0]
    player_nac = player[0][1]

    print(
        f"Rank ID: {rankId} - Jugadores Extranjeros: {jugadoresExtranjeros} - Jugadores Nacionales: {jugadoresNacionales}")
    cur.execute(
        '''UPDATE rankings SET jugadores_extranjeros = %s, jugadores_nacionales = %s WHERE `rank` = %s;''',
        (jugadoresExtranjeros, jugadoresNacionales, rankId))
    conn.commit()
    cur.execute('SELECT jugadores_extranjeros, jugadores_nacionales FROM rankings WHERE `rank` = %s;', (rankId,))
    playerUpdated = cur.fetchall()
    player_ext_updated = playerUpdated[0][0]
    player_nac_updated = playerUpdated[0][1]

    query = """
                   select `rank`, country_id, total_points, previous_points, rank_change, rank_date, jugadores_plantilla, jugadores_extranjeros, jugadores_nacionales, edad_promedio, altura_promedio, valor_total from rankings where rank_date = %s;
                   """
    cur.execute(query, (latest_date,))
    rankingactual = cur.fetchall()

    updated_ranking = []

    for rank in rankingactual:
        rank_country_id = rank[1]
        updated_rank = list(rank)

        # Actualizar la fecha del ranking para todos
        updated_rank[5] = newDate

        if rank[0] == rankId:
            # Comparar valores actualizados con los valores previos y actualizar puntos si es necesario
            new_player_points = updated_rank[2]
            print(f"Actualizando puntos para el país ID {rank_country_id}:")
            print(
                f"Jugadores Extranjeros previos: {player_ext}, Jugadores Extranjeros actualizados: {player_ext_updated}")
            print(
                f"Jugadores Nacionales previos: {player_nac}, Jugadores Nacionales actualizados: {player_nac_updated}")

            if player_ext_updated > player_ext:
                new_player_points += 10
                print(f"Se suman 10 puntos por jugadores extranjeros. Nuevos puntos: {new_player_points}")
            elif player_ext_updated < player_ext:
                new_player_points -= 10
                print(f"Se restan 10 puntos por jugadores extranjeros. Nuevos puntos: {new_player_points}")

            updated_rank[2] = new_player_points  # Actualizar total_points

        updated_ranking.append(updated_rank)

    print(f"Ranking Actualizado: {updated_ranking}")
    rankingOrdenado = calculate_ranking(updated_ranking)
    print(f"Ranking Ordenado: {rankingOrdenado}")
    save_ranking(rankingOrdenado)
    cur.close()
    conn.close()
    return jsonify({'Message': 'Rank updated successfully'})


@app.get('/api/rankings/total_points/<int:id>')
def get_total_points(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT total_points FROM rankings WHERE country_id = %s;', (id,))
    points = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(points)


if __name__ == '__main__':
    app.run()
