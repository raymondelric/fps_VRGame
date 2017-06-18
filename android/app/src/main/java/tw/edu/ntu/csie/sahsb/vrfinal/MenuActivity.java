package tw.edu.ntu.csie.sahsb.vrfinal;

import android.app.ActivityOptions;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Bundle;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.util.SparseIntArray;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;
import java.util.UUID;

import mehdi.sakout.fancybuttons.FancyButton;
import tw.edu.ntu.csie.sahsb.vrfinal.R;

public class MenuActivity extends AppCompatActivity {
    public static Socket mSocket;
    SoundPool soundPool;
    SparseIntArray soundPoolMap;
    private Button URL_button;
    String URL = null;

    //For player identification
    public static String uuid = UUID.randomUUID().toString().replaceAll("-", "");
    public static int player;

    public static String magic = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        soundPool = new SoundPool(1, AudioManager.STREAM_MUSIC, 100);
        soundPoolMap = new SparseIntArray();
        soundPoolMap.put(1, soundPool.load(this, R.raw.link, 1));

        URL_button = (Button) findViewById(R.id.url_btn);

        FancyButton play_btn = (FancyButton) findViewById(R.id.playBtn);
        play_btn.setClickable(false);

        Button hash_btn = (Button) findViewById(R.id.hash_btn);

        if( hash_btn != null )   {
            hash_btn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    type_number();
                }
            });
        }
        URL = getPreferences(MODE_PRIVATE).getString("connection", "http://10.5.5.76:3000/");
        if( mSocket == null ) {
            try {
                mSocket = IO.socket(URL);
            }catch (URISyntaxException e)   {
                e.printStackTrace();
            }

            ConnectandWaitforConfirm();
        }

        if( URL_button != null )    {
            URL_button.setText(URL);
            URL_button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(MenuActivity.this);
                    builder.setTitle("enter your target URL");

                    // Set up the input
                    final EditText input = new EditText(MenuActivity.this);
                    input.setText(URL);
                    // Specify the type of input expected;
                    builder.setView(input);

                    // Set up the buttons
                    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {

                            URL = input.getText().toString();
                            URL_button.setText(URL);
                            getPreferences(MODE_PRIVATE).edit().putString("connection", URL).apply();
                            try {
                                mSocket = IO.socket(URL);
                            }catch (URISyntaxException e)   {
                                e.printStackTrace();
                            }

                            if( mSocket.connected() )
                                mSocket.disconnect();
                            if( mSocket.hasListeners("connectOK") )
                                mSocket.off("connectOK", onConnectOK);

                            ConnectandWaitforConfirm();
                            dialog.dismiss();
                        }
                    });
                    builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.cancel();
                        }
                    });

                    builder.show();
                }
            });
        }
    }

    public void goPlay(View v){
        EditText username = (EditText) findViewById(R.id.username);

        mSocket.emit("username1" + magic, username.getText().toString());
        mSocket.emit("gameStart" + magic, "0");

        Intent single = new Intent(MenuActivity.this, MainActivity.class);
        playSound(1);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            View sharedView = v;
            String transitionName = getString(R.string.blue_transitionName);

            ActivityOptions transitionActivityOptions = null;
            transitionActivityOptions = ActivityOptions.makeSceneTransitionAnimation(MenuActivity.this, sharedView, transitionName);
            startActivity(single, transitionActivityOptions.toBundle());
        }else {
            startActivity(single);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        Utils.full_screen_mode(getWindow().getDecorView());
    }

    public void type_number()   {
        AlertDialog.Builder builder = new AlertDialog.Builder(MenuActivity.this);
        builder.setTitle("enter your magic hash");

        // Set up the input
        final EditText input = new EditText(MenuActivity.this);

        input.setText("aaaaa");
        // Specify the type of input expected;
        builder.setView(input);

        // Set up the buttons
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                magic = input.getText().toString();
                try {
                    mSocket = IO.socket(URL);
                }catch (URISyntaxException e)   {
                    e.printStackTrace();
                }

                mSocket.disconnect();
                mSocket.off("connectOK", onConnectOK);
                mSocket.off(uuid, onRealConnect);
                if( magic.length() > 0 )    {
                    mSocket.off("connectOK"+magic, onRealConnect);
                    mSocket.on("connectOK"+magic, onRealConnect);
                }

                ConnectandWaitforConfirm();
                mSocket.emit("magic", magic);
                dialog.dismiss();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });

        builder.show();
    }


    private Emitter.Listener onConnectOK = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            MenuActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    String message = (String)args[0];

                    if (message.equals("OK")) {
                        setRealConnectListener();
                        mSocket.emit("requestPlayer" + magic, uuid);
                    } else if( message.equals("Failed") )   {
                        Toast.makeText(MenuActivity.this, "connect failed", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    };

    public void ConnectandWaitforConfirm()    {
        mSocket.once("connectOK", onConnectOK);
        //Log.e("CWC", "before connect");
        mSocket.connect();
        //Log.e("CWC", "connectOK");
    }


    //TODO: change activity to mainActivity then start Thread
    public void setRealConnectListener()   {
        mSocket.on("connectOK"+magic, onRealConnect);
        mSocket.on(uuid, onRealConnect);
    }

    // unique listener
    private Emitter.Listener onRealConnect = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    String message = (String) args[0];

                    if (message.equals("player1")) {
                        player = 1;
                        FancyButton play_btn = (FancyButton) findViewById(R.id.playBtn);
                        play_btn.setClickable(true);
                    } else if (message.equals("checkConnect")) {
                        mSocket.emit("stillConnect" + magic, uuid);
                    }
                }
            });
        }
    };

    public void playSound(int num){
        AudioManager audioManager = (AudioManager)getSystemService(Context.AUDIO_SERVICE);
        float curVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
        float maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        float leftVolume = curVolume/maxVolume;
        float rightVolume = curVolume/maxVolume;
        int priority = 1;
        int no_loop = 0;
        float normal_playback_rate = 1f;
        soundPool.play(num, leftVolume, rightVolume, priority, no_loop, normal_playback_rate);
    }
}