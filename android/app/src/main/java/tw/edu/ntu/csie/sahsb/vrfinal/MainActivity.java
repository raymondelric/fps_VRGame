package tw.edu.ntu.csie.sahsb.vrfinal;

import android.app.Service;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Vibrator;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageSwitcher;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.ViewSwitcher;

import com.github.nkzawa.emitter.Emitter;
import java.util.Timer;
import java.util.TimerTask;

import tw.edu.ntu.csie.sahsb.vrfinal.R;

public class MainActivity extends AppCompatActivity implements SensorEventListener, ViewSwitcher.ViewFactory, DrawerLayout.DrawerListener{

    private SensorManager sManager;
    Sensor accelerometer;
    Sensor magnetometer;
    float[] mGravity;
    float[] mGeomagnetic;
    String[] ZYXvalue = new String[3];
    Timer timer;
    Vibrator myVibrator;
    Boolean menu_state = true;
    ViewGroup container;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        Utils.full_screen_mode(getWindow().getDecorView());

        MenuActivity.mSocket.on("connectOK" + MenuActivity.magic, onRealConnect);
        MenuActivity.mSocket.on(MenuActivity.uuid, onRealConnect);

        View mContentView = findViewById(R.id.fullscreen_content);
        if( mContentView != null )
            mContentView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSend(view);
                myVibrator.vibrate(100);
            }
        });

        container = (ViewGroup) findViewById(R.id.container);
        myVibrator = (Vibrator) getApplication().getSystemService(Service.VIBRATOR_SERVICE);
        sManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        accelerometer = sManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        magnetometer = sManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        timer = new Timer(true);
        timer.schedule(new MyTimerTask(), 80, 80);
    }

    @Override
    public View makeView() {
        ImageView imageView = new ImageView(this);
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        imageView.setLayoutParams(new ImageSwitcher.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT));
        return imageView;
    }

    @Override
    protected void onResume()
    {
        super.onResume();
        sManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
        sManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_UI);
    }

    protected void onPause() {
        super.onPause();
        sManager.unregisterListener(this);
        if( timer != null ) {
            timer.cancel();
        }
        MenuActivity.mSocket.disconnect();
        //MenuActivity.mSocket.off("connectOK", onConnectOK);
        if( MenuActivity.magic.length() > 0 )
            MenuActivity.mSocket.off("connectOK"+MenuActivity.magic, onRealConnect);
    }

    @Override
    protected void onStop()
    {
        sManager.unregisterListener(this);
        super.onStop();

        if( MenuActivity.mSocket != null )   {
            if( MenuActivity.mSocket.connected() )   {
                MenuActivity.mSocket.disconnect();
            }
            //MenuActivity.mSocket.off("connectOK", onConnectOK);
            if( MenuActivity.magic.length() > 0 )
                MenuActivity.mSocket.off("connectOK"+MenuActivity.magic, onRealConnect);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor arg0, int arg1)
    {
    }

    @Override
    public void onSensorChanged(SensorEvent event)
    {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER)
            mGravity = event.values;
        if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD)
            mGeomagnetic = event.values;
        if (mGravity != null && mGeomagnetic != null) {
            float R[] = new float[9];
            float I[] = new float[9];
            boolean success = SensorManager.getRotationMatrix(R, I, mGravity, mGeomagnetic);
            if (success) {
                float orientation[] = new float[3];
                SensorManager.getOrientation(R, orientation);
                ZYXvalue[0] = Float.toString((float) Math.toDegrees(orientation[0]));
                ZYXvalue[1] = Float.toString((float) Math.toDegrees(orientation[1]));
                ZYXvalue[2] = Float.toString((float) Math.toDegrees(orientation[2]));
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    public void attemptSend(View v) {
        String message = "fire";
        if(menu_state){
            message = "start";
            menu_state = false;
        }
        switch (MenuActivity.player) {
            case 1:
                MenuActivity.mSocket.emit("message1"+MenuActivity.magic, message);
                break;
            case 2:
                MenuActivity.mSocket.emit("message2"+MenuActivity.magic, message);
                break;
        }
    }

    private Emitter.Listener onRealConnect = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    String message = (String) args[0];

                    if (message.equals("checkConnect")) {
                        MenuActivity.mSocket.emit("stillConnect" + MenuActivity.magic, MenuActivity.uuid);
                    }
                }
            });
        }
    };

    @Override
    public void onDrawerSlide(View drawerView, float slideOffset) {
    }

    @Override
    public void onDrawerOpened(View drawerView) {
    }

    @Override
    public void onDrawerClosed(View drawerView) {
    }

    @Override
    public void onDrawerStateChanged(int newState) {
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        Utils.full_screen_mode(getWindow().getDecorView());
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
    }

    public class MyTimerTask extends TimerTask
    {
        public void run()
        {
            MenuActivity.mSocket.emit("X1"+MenuActivity.magic, ZYXvalue[2]);
            MenuActivity.mSocket.emit("Y1"+MenuActivity.magic, ZYXvalue[1]);
        }
    }
}
