#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
import sys
import json

input_data = sys.stdin.read().split('\n')
gvs_string = input_data[0]
hvs_string = input_data[1]
period = input_data[2]

gvs_json = json.loads(gvs_string)
hvs_json = json.loads(hvs_string)
n_steps_ = int(period) # параметр числа часов предсказания!

# Преобразуем JSON в DataFrame
df_gvs = pd.DataFrame(gvs_json) # GVS!
df_hvs = pd.DataFrame(hvs_json) # HVS!
# Если нужно, преобразуем datetime в тип datetime64
df_gvs["datetime"] = pd.to_datetime(df_gvs["datetime"])
df_hvs["datetime"] = pd.to_datetime(df_hvs["datetime"])

# Это новая функция, она берет нужный шаг и на старых данных делает новые) 
# Выдает и старые и новые дописанные
def extend_gvs(df_gvs: pd.DataFrame, n_steps_: int) -> pd.DataFrame:
    df_gvs = df_gvs.copy()

    # последний datetime
    last_dt = df_gvs["datetime"].max()

    # шаги (часовые)
    new_datetimes = pd.date_range(start=last_dt + pd.Timedelta(hours=1), periods=n_steps_, freq="h")

    new_rows = []
    for dt in new_datetimes:
        # формируем date и time
        date_str = dt.strftime("%Y-%m-%d")
        hour = dt.hour
        time_str = f"{hour}-{hour+1}"

        # дата 3 недели назад
        lookup_dt = dt - pd.Timedelta(weeks=3)

        # ищем строку с этим datetime
        prev_row = df_gvs.loc[df_gvs["datetime"] == lookup_dt]

        if not prev_row.empty:
            to_val = prev_row["to"].values[0] * (1 + np.random.uniform(-0.03, 0.03))
            total_val = prev_row["total"].values[0] * (1 + np.random.uniform(-0.03, 0.03))
        else:
            to_val, total_val = np.nan, np.nan

        out_val = to_val - total_val if pd.notna(to_val) and pd.notna(total_val) else np.nan

        new_rows.append({
            "date": date_str,
            "time": time_str,
            "to": to_val,
            "out": out_val,
            "total": total_val,
            "t1": np.nan,
            "t2": np.nan,
            "datetime": dt
        })

    # объединяем
    df_new = pd.DataFrame(new_rows)
    df_extended = pd.concat([df_gvs, df_new], ignore_index=True)

    return df_extended

# Перезаписываем её и дальше как с обычными данными
df_gvs_extended = extend_gvs(df_gvs, n_steps_= n_steps_)
df_gvs = df_gvs_extended.copy()

# Разница
df_gvs["diff"] = df_gvs["t1"] - df_gvs["t2"]

# Новая колонка: 0 если diff в диапазоне [17,23), иначе 1
df_gvs["temp_warning"] = ((df_gvs["diff"] < 17) | (df_gvs["diff"] >= 23)).astype(int)
# Если 1, то: 
# Предупреждение: Требуется провести проверку системы теплоснабжения.
# Причина: разница температур T1−T2 вышла за пределы нормы (17–23 °С), что может свидетельствовать о нарушении работы теплообменника или циркуляции теплоносителя.

# Присоединяем инфу о ГВС для сверки
df_merged = df_gvs.merge(
    df_hvs[["date", "time", "delta"]],
    on=["date", "time"],
    how="left"   # или "inner", если нужны только совпадающие строки
)

# вычисляем относительное отклонение (в процентах)
df_merged["deviation"] = (df_merged["total"] - df_merged["delta"]).abs() / df_merged["total"] * 100

# присваиваем категории по условиям
df_merged["deviation_warning"] = np.select(
    [
        df_merged["deviation"] < 5,                       # меньше 5%
        (df_merged["deviation"] >= 5) & (df_merged["deviation"] < 10),  # 5–10%
        df_merged["deviation"] >= 10                      # 10% и выше
    ],
    [0, 1, 2],
    default=np.nan  # если вдруг будут NaN или не попало никуда
)

# Если 1, то: 
# Предупреждение (отклонение 5%)
# Требуется провести проверку корректности работы узлов учета ХВС и ОДПУ ГВС.
# Причина: зафиксировано превышение допустимого отклонения показаний на уровне 5%, что может свидетельствовать о начальных признаках аномалий (неисправность приборов учета, мелкие утечки, некорректная работа системы).
# Если 2, то: 
# Предупреждение (отклонение 10%)
# Требуется незамедлительно инициировать анализ и диагностику системы учета ХВС и ОДПУ ГВС с привлечением сервисной бригады.
# Причина: зафиксировано превышение допустимого отклонения показаний на уровне 10%, что считается аномалией и может быть связано с утечкой ГВС, неисправностью узлов учета, внешним воздействием либо бездоговорным потреблением.


# экспорт в JSON строку (list of records)
json_gvs = df_merged.to_json(orient="records", force_ascii=False, indent=2)


# выводим
sys.stdout.write(json_gvs)
sys.stdout.flush()