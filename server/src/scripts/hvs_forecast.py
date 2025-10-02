#!/usr/bin/env python
# coding: utf-8

# In[9]:


# импорт всех либ, которые будут нужны для корректной работы
import pandas as pd
import numpy as np
# from statsmodels.tsa.arima.model import ARIMA
import pickle
import sys
import json

# In[8]:


input_data = sys.stdin.read().split('\n')
gvs_string = input_data[0]
hvs_string = input_data[1]
period = input_data[2]

gvs_json = json.loads(gvs_string)
hvs_json = json.loads(hvs_string)

# Преобразуем JSON в DataFrame
df_gvs = pd.DataFrame(gvs_json) # GVS!
df_hvs = pd.DataFrame(hvs_json) # HVS!
n_steps_ = int(period) # параметр числа часов предсказания!
# Если нужно, преобразуем datetime в тип datetime64
df_gvs["datetime"] = pd.to_datetime(df_gvs["datetime"])
df_hvs["datetime"] = pd.to_datetime(df_hvs["datetime"])

# In[3]:


# создаём новую колонку total
init_value = df_hvs["total"].iloc[0]  # стартовое значение
df_hvs["total_new"] = init_value + df_hvs["delta"].cumsum().shift(fill_value=0)
# df_hvs


# In[4]:


import pandas as pd
import numpy as np

def seasonal_delta_forecast(df, n_steps=24, noise_percent=3):
    """
    Сезонный прогноз на основе усреднения delta по дню недели и часу.
    """
    df = df.copy()
    df["weekday"] = df["datetime"].dt.weekday
    df["hour"] = df["datetime"].dt.hour

    last_datetime = df["datetime"].max()
    future_datetimes = pd.date_range(start=last_datetime + pd.Timedelta(hours=1),
                                     periods=n_steps, freq='h')

    delta_preds = []

    for dt in future_datetimes:
        weekday = dt.weekday()
        hour = dt.hour

        mask = (df["weekday"] == weekday) & (df["hour"] == hour)
        recent_vals = df.loc[mask, "delta"].tail(3)

        if len(recent_vals) == 0:
            mean_val = df["delta"].mean()
        else:
            mean_val = recent_vals.mean()

        noise = mean_val * noise_percent / 100
        pred = mean_val + np.random.uniform(-noise, noise)
        delta_preds.append(pred)

        # добавляем прогноз в df, чтобы учитывать его в следующих шагах
        df = pd.concat([df, pd.DataFrame({"datetime":[dt],
                                          "delta":[pred],
                                          "weekday":[weekday],
                                          "hour":[hour]})],
                       ignore_index=True)

    return pd.DataFrame({"datetime": future_datetimes, "delta_pred": delta_preds})

def combined_forecast(df_hvs, n_steps=24, noise_percent=5):
    """
    Итеративный сезонный прогноз:
    - если есть данные ровно за неделю назад → берём их
    - если нет, используем предсказанные значения (прогноз на прогнозе)
    - добавляем случайный шум ±noise_percent%
    """
    df = df_hvs.copy()
    df = df[["datetime", "delta"]].copy()

    last_datetime = df["datetime"].max()
    future_datetimes = pd.date_range(
        start=last_datetime + pd.Timedelta(hours=1),
        periods=n_steps,
        freq="h"
    )

    forecast_rows = []

    for dt in future_datetimes:
        past_dt = dt - pd.Timedelta(weeks=1)
        row = df.loc[df["datetime"] == past_dt]

        if not row.empty:
            base_val = row["delta"].values[0]
        else:
            # если нет "реальной" точки, смотрим в уже построенном прогнозе
            prev_row = next((r for r in forecast_rows if r["datetime"] == past_dt), None)
            if prev_row is not None:
                base_val = prev_row["delta_pred"]
            else:
                # fallback: берём среднее из df
                base_val = df["delta"].iloc[-1]

        # добавляем шум
        noise = np.random.uniform(-noise_percent/100, noise_percent/100)
        delta_pred = base_val * (1 + noise)

        forecast_rows.append({"datetime": dt, "delta_pred": delta_pred})

        # важно! добавляем предсказанную точку в df, чтобы дальше можно было её использовать
        df = pd.concat([df, pd.DataFrame({"datetime": [dt], "delta": [delta_pred]})],
                       ignore_index=True)

    return pd.DataFrame(forecast_rows)


# In[5]:


# Загружаем обученную ARIMA-модель
# with open("arima_model.pkl", "rb") as f:
#     model_fit = pickle.load(f)

# Теперь можно использовать её в нашей функции
n_steps = n_steps_
forecast_df = combined_forecast(df_hvs, n_steps=n_steps, noise_percent=3)


# In[10]:


# 1. time колонка в формате 0-1, 1-2 и т.д.
forecast_df["hour"] = forecast_df["datetime"].dt.hour
forecast_df["time"] = forecast_df["hour"].astype(str) + "-" + (forecast_df["hour"] + 1).astype(str)

# 2. Переименовать delta_pred → delta
forecast_df = forecast_df.rename(columns={"delta_pred": "delta"})

# 3. Колонка date в формате YYYY-MM-DD
forecast_df["date"] = forecast_df["datetime"].dt.strftime("%Y-%m-%d")

# 4. total = cumsum(delta).shift(fill_value=0)
forecast_df["total"] = (df_hvs["total"].iloc[-1] + forecast_df["delta"].cumsum().shift(fill_value=0)).round(2)
# Предупреждение: Требуется направить сервисную бригаду для выполнения ТО насоса во избежание риска аварийного отказа оборудования. 
# Причина: работа насоса ХВС более 70 тыс. часов.
forecast_df["maintenance"] = 1

# Убираем вспомогательную колонку hour
forecast_df = forecast_df.drop(columns=["hour"])


# In[ ]:

df_hvs["forecast"] = 0
forecast_df["forecast"] = 1

df_hvs = pd.concat([df_hvs, forecast_df], ignore_index=True)
df_hvs['delta'] = (df_hvs['delta']).round(2)

# In[6]:

# Выгрузка в JSON-файлы
# forecast_df.to_json("forecast_df.json", orient="records", force_ascii=False, date_format="iso")
# df_gvs.to_json("df_gvs.json", orient="records", force_ascii=False, date_format="iso")
# df_hvs.to_json("df_hvs.json", orient="records", force_ascii=False, date_format="iso")

# экспорт в JSON строку (list of records)
json_hvs = df_hvs.to_json(orient="records", force_ascii=False, indent=2)


# выводим
sys.stdout.write(json_hvs)
sys.stdout.flush()

