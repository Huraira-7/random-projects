import os
import json
import random
import datetime
from kivy.metrics import dp
from kivy.app import App
from kivy.clock import Clock
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.animation import Animation
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.textinput import TextInput
from plyer import notification
from kivy.properties import ObjectProperty
from kivy.uix.scrollview import ScrollView
from kivy.utils import get_color_from_hex
from kivy.uix.screenmanager import Screen, ScreenManager

class ReminderApp(App):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.daily_reminders = []
        self.specific_date_reminders = {}
        
        self.daily_notification_scheduled = False
        self.screen_manager = None
        self.main_screen = None
        self.daily_reminders_screen = None
        self.specific_reminders_screen = None

    def build(self):
        self.load_reminders()  # Load reminders on startup
        self.screen_manager = ScreenManager()

        self.main_screen = MainScreen(name='main', app=self)
        self.daily_reminders_screen = DailyRemindersScreen(name='daily', app=self)
        self.specific_reminders_screen = SpecificRemindersScreen(name='specific', app=self)

        self.screen_manager.add_widget(self.main_screen)
        self.screen_manager.add_widget(self.daily_reminders_screen)
        self.screen_manager.add_widget(self.specific_reminders_screen)

        # Schedule daily reminder check
        Clock.schedule_interval(self.schedule_daily_notification, 3600)
        # Schedule specific date reminder check
        Clock.schedule_once(self.check_specific_date_reminder, 1)

        return self.screen_manager
    
    def get_storage_path(self):
        """Get a platform-appropriate path for storing the JSON file."""
        # from plyer import storagepath
        # app_dir = storagepath.get_application_dir()
        # file_path = os.path.join(app_dir, "reminders.json")
        # # Ensure the directory exists
        # os.makedirs(app_dir, exist_ok=True)
        file_path = os.path.join(os.getcwd(), "reminders.json")
        return file_path

    def save_reminders(self):
        """Save specific and daily reminders to a JSON file."""
        data = {
            "specific_date_reminders": self.specific_date_reminders,
            "daily_reminders": self.daily_reminders
        }
        try:
            with open(self.get_storage_path(), 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            # Display error to user via a screen (e.g., main_screen)
            if hasattr(self, 'main_screen') and hasattr(self.main_screen, 'error_label'):
                self.main_screen.error_label.text = f"Failed to save reminders: {str(e)}"
                self.fade_error_message(self.main_screen.error_label)
            print(f"Error saving reminders: {e}")

    def load_reminders(self):
        """Load specific and daily reminders from a JSON file."""
        file_path = self.get_storage_path()
        print("filepath", file_path)
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    self.specific_date_reminders.update(data.get("specific_date_reminders", {}))
                    self.daily_reminders.extend(data.get("daily_reminders", []))
            else:
                print("file-path-no-exists")
        except Exception as e:
            # Display error to user via a screen
            if hasattr(self, 'main_screen') and hasattr(self.main_screen, 'error_label'):
                self.main_screen.error_label.text = f"Failed to load reminders: {str(e)}"
                self.fade_error_message(self.main_screen.error_label)
            self.specific_date_reminders = {}
            self.daily_reminders = []

    def fade_error_message(self, error_label):
        """Fade out the error message on a given label."""
        anim = Animation(opacity=0, duration=3)
        anim.start(error_label)
        Clock.schedule_once(lambda dt: self.reset_error_opacity(error_label), 3)

    def reset_error_opacity(self, error_label):
        """Reset the error label's opacity and text."""
        error_label.opacity = 1
        error_label.text = ""

    def get_random_reminder(self):
        return random.choice(self.daily_reminders)

    def get_random_time(self, start_hour=6, end_hour=18):
        random_hour = random.randint(start_hour, end_hour)
        random_minute = random.randint(0, 59)
        return datetime.time(random_hour, random_minute)

    def schedule_daily_notification(self, dt):
        now = datetime.datetime.now()
        if 6 <= now.hour < 18 and not self.daily_notification_scheduled:
            random_time = self.get_random_time()
            schedule_at = datetime.datetime.combine(now.date(), random_time)
            delay = (schedule_at - now).total_seconds()
            if delay > 0:
                reminder_text = self.get_random_reminder()
                Clock.schedule_once(lambda dt: self.send_notification("Daily Reminder", reminder_text), delay)
                # print(f"Daily notification scheduled for {schedule_at.strftime('%H:%M:%S')}: {reminder_text}")
                self.daily_notification_scheduled = True
        elif now.hour >= 18:
            self.daily_notification_scheduled = False

    def check_specific_date_reminder(self, dt):
        today = datetime.date.today().strftime("%Y-%m-%d")
        if today in self.specific_date_reminders:
            reminder_text = self.specific_date_reminders[today]
            self.send_notification("Specific Reminder", reminder_text)
            # print(f"Specific date reminder for today ({today}): {reminder_text}")

    def send_notification(self, title, message):
        notification.notify(
            title=title,
            message=message,
            app_name="ReminderApp",
            app_icon=None,
            timeout=10,
        )
        self.main_screen.update_reminder_text(f'"{message}"')

    def on_pause(self):
        return True

    def on_resume(self, *args):
        pass


class MainScreen(Screen):
    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        self.error_label = Label(text="", color=get_color_from_hex('#FF0000'), size_hint_y=None, height=30)
        layout.add_widget(self.error_label)

        # Label for today's reminders
        self.reminders_title = Label(text="Today's Reminders", size_hint_y=None, height=40, font_size=20)
        layout.add_widget(self.reminders_title)

        # ScrollView for reminders
        self.scroll_view = ScrollView()
        self.reminders_layout = BoxLayout(orientation='vertical', spacing=dp(10), size_hint_y=None)
        self.reminders_layout.bind(minimum_height=self.reminders_layout.setter('height'))
        self.scroll_view.add_widget(self.reminders_layout)
        layout.add_widget(self.scroll_view)

        # Navigation buttons
        specific_button = Button(text="Specific Reminders", size_hint_y=None, height=50)
        specific_button.bind(on_press=lambda x: self.manager.switch_to(self.app.specific_reminders_screen))
        layout.add_widget(specific_button)

        daily_button = Button(text="Daily Reminders", size_hint_y=None, height=50)
        daily_button.bind(on_press=lambda x: self.manager.switch_to(self.app.daily_reminders_screen))
        layout.add_widget(daily_button)

        self.add_widget(layout)
        self.bind(size=self.update_reminder_widths)
        self.bind(on_enter=self.update_reminders_display)

    def update_reminder_widths(self, *args):
        """Update the text_size of all reminder labels when screen size changes."""
        for child in self.reminders_layout.children:
            if isinstance(child, ReminderWidget):
                child.label.text_size = (self.width * 0.65 - dp(20), None)

    def update_reminders_display(self, *args):
        """Update the display of today's specific reminders and all daily reminders."""
        self.reminders_layout.clear_widgets()
        today = datetime.date.today().strftime('%Y-%m-%d')

        # Add today's specific reminders
        if today in self.app.specific_date_reminders:
            reminder_text = self.app.specific_date_reminders[today]
            reminder_widget = ReminderWidget(
                date=today,
                reminder_text=reminder_text,
                screen_width=self.width,
                edit_callback=lambda d, r: self.app.specific_reminders_screen.edit_reminder(d, r),
                delete_callback=lambda d: self.app.specific_reminders_screen.delete_specific_reminder(d)
            )
            self.reminders_layout.add_widget(reminder_widget)
        else:
            no_reminders_label = Label(
                text="Nothing for today...",
                size_hint=(1, None),
                height=dp(50),
                halign='center',
                valign='middle',
                font_size=25
            )
            no_reminders_label.bind(size=lambda instance, value: no_reminders_label.setter('text_size')(instance, value))
            self.reminders_layout.add_widget(no_reminders_label)


class ReminderWidget(BoxLayout):
    """Custom widget for a reminder with a label and edit button."""
    def __init__(self, date, reminder_text, screen_width, edit_callback, delete_callback, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'horizontal'
        self.size_hint_y = None
        self.height = dp(50)  # Initial height, will adjust dynamically
        self.spacing = dp(5)

        # Label for reminder text
        self.label = Label(
            text=f"{date}: {reminder_text}",
            size_hint=(0.8, None),  # 80% for label, leaving space for button
            height=dp(50),
            text_size=(screen_width * 0.75 - dp(20), None),  # Constrain width with padding
            halign='left',
            valign='top',
            padding=[dp(5), dp(5)]
        )
        self.label.bind(texture_size=self._update_label_size)
        self.add_widget(self.label)

        # Edit button
        self.edit_button = Button(
            text="Edit",
            size_hint=(0.12, None),
            height=dp(50),
            width=dp(50)
        )
        
        self.edit_button.bind(on_press=lambda btn, d=date, r=reminder_text: edit_callback(d, r))
        self.add_widget(self.edit_button)

        self.delete_button = Button(
            text="Delete",
            size_hint=(0.12, None),
            height=dp(50),
            width=dp(50)
        )
        self.delete_button.bind(on_press=lambda instance: delete_callback(date))
        self.add_widget(self.delete_button)


    def _update_label_size(self, instance, texture_size):
        """Update the label and widget height based on text size."""
        self.label.height = texture_size[1] + dp(10)
        self.height = max(self.label.height, dp(50))  # Ensure button height is respected
        # self.edit_button.height = self.height  # Sync button height
        # self.delete_button.height = self.height # Sync button height


class DailyRemindersScreen(Screen):
    scroll_view = ObjectProperty(None)

    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical', padding=10)

        self.error_label = Label(text="", color=get_color_from_hex('#FF0000'), size_hint_y=None, height=30)
        layout.add_widget(self.error_label)

        self.scroll_view = ScrollView()
        self.reminders_layout = BoxLayout(orientation='vertical', spacing=dp(10), size_hint_y=None)
        self.reminders_layout.bind(minimum_height=self.reminders_layout.setter('height'))
        self.scroll_view.add_widget(self.reminders_layout)
        layout.add_widget(self.scroll_view)

        layout.add_widget(Label(size_hint_y=None, height=10))  # Spacer

        add_layout = BoxLayout(size_hint_y=None, height=50, spacing=10)
        self.new_daily_reminder = TextInput(hint_text="New reminder", multiline=False)
        add_button = Button(text="Add")
        add_button.bind(on_press=self.add_daily_reminder)
        add_layout.add_widget(self.new_daily_reminder)
        add_layout.add_widget(add_button)
        layout.add_widget(add_layout)

        back_button = Button(text="Back to Main", size_hint_y=None, height=50)
        back_button.bind(on_press=lambda x: self.manager.switch_to(self.app.main_screen))
        layout.add_widget(back_button)

        self.add_widget(layout)
        self.bind(size=self.update_reminder_widths)
        self.bind(on_enter=self.update_daily_reminders_display)

    def update_reminder_widths(self, *args):
        """Update the text_size of all reminder labels when screen size changes."""
        for child in self.reminders_layout.children:
            if isinstance(child, ReminderWidget):
                child.label.text_size = (self.width * 0.65 - dp(20), None)

    def update_daily_reminders_display(self, *args):
        """Update the reminders display."""
        self.reminders_layout.clear_widgets()
        # print(self.app.daily_reminders)
        for index, reminder in enumerate(self.app.daily_reminders):
            reminder_widget = ReminderWidget(
                date=index,
                reminder_text=reminder,
                screen_width=self.width,
                edit_callback=self.open_edit_daily_reminder_popup,
                delete_callback=self.delete_daily_reminder
            )
            self.reminders_layout.add_widget(reminder_widget)

    def add_daily_reminder(self, instance):
        """Add a new daily reminder."""
        new_reminder = self.new_daily_reminder.text.strip()
        if new_reminder:
            self.app.daily_reminders.append(new_reminder)
            self.app.save_reminders()  
            self.new_daily_reminder.text = ""
            self.update_daily_reminders_display()
            self.fade_error_message()
        else:
            self.error_label.text = "Reminder text cannot be empty."
            self.fade_error_message()

    def delete_daily_reminder(self, index):
        """Delete a daily reminder by index."""
        if 0 <= index < len(self.app.daily_reminders):
            del self.app.daily_reminders[index]
            self.app.save_reminders()  
            self.update_daily_reminders_display()
            self.fade_error_message()

    def open_edit_daily_reminder_popup(self, index, current_reminder):
        """Open a popup to edit a daily reminder."""
        content = BoxLayout(orientation='vertical', spacing=10)
        input_text = TextInput(text=current_reminder, multiline=False, size_hint=(1, None), height=60)
        save_button = Button(text="Save", size_hint_y=None, height=50)
        content.add_widget(input_text)
        content.add_widget(save_button)

        popup = Popup(title="Edit Reminder", content=content, size_hint=(None, None), size=(400, 200))
        save_button.bind(on_press=lambda btn: self.save_edited_daily_reminder(index, input_text.text, popup))
        popup.open()

    def save_edited_daily_reminder(self, index, new_text, popup):
        """Save the edited daily reminder."""
        new_text = new_text.strip()
        if new_text and 0 <= index < len(self.app.daily_reminders):
            self.app.daily_reminders[index] = new_text
            self.app.save_reminders()  
            self.update_daily_reminders_display()
            self.fade_error_message()
            popup.dismiss()
        else:
            self.error_label.text = "Reminder text cannot be empty."
            self.fade_error_message()

    def fade_error_message(self):
        """Fade out the error message."""
        anim = Animation(opacity=0, duration=3)
        anim.start(self.error_label)
        Clock.schedule_once(self.reset_error_opacity, 3)

    def reset_error_opacity(self, dt):
        """Reset the error label's opacity and text."""
        self.error_label.opacity = 1
        self.error_label.text = ""


class SpecificRemindersScreen(Screen):
    scroll_view = ObjectProperty(None)

    def __init__(self, app, **kwargs):
        super().__init__(**kwargs)
        self.app = app
        layout = BoxLayout(orientation='vertical', padding=10)

        self.error_label = Label(text="", color=get_color_from_hex('#FF0000'), size_hint_y=None, height=30)
        layout.add_widget(self.error_label)

        self.scroll_view = ScrollView()
        self.reminders_layout = BoxLayout(orientation='vertical', spacing=dp(10), size_hint_y=None)
        self.reminders_layout.bind(minimum_height=self.reminders_layout.setter('height'))
        self.scroll_view.add_widget(self.reminders_layout)
        layout.add_widget(self.scroll_view)

        layout.add_widget(Label(size_hint_y=None, height=10))  # Spacer

        add_layout = BoxLayout(size_hint_y=None, height=80, spacing=10)
        self.new_specific_date = TextInput(hint_text="YYYY-MM-DD", multiline=False)
        self.new_specific_reminder = TextInput(hint_text="Reminder text", multiline=False)
        add_button = Button(text="Add")
        add_button.bind(on_press=self.add_specific_reminder)
        add_layout.add_widget(self.new_specific_date)
        add_layout.add_widget(self.new_specific_reminder)
        add_layout.add_widget(add_button)
        layout.add_widget(add_layout)

        back_button = Button(text="Back to Main", size_hint_y=None, height=50)
        back_button.bind(on_press=lambda x: self.manager.switch_to(self.app.main_screen))
        layout.add_widget(back_button)

        self.add_widget(layout)
        self.current_editing_date = None
        self.bind(size=self.update_reminder_widths)
        self.bind(on_enter=self.update_specific_reminders_display)

    def update_reminder_widths(self, *args):
        """Update the text_size of all reminder labels when screen size changes."""
        for child in self.reminders_layout.children:
            if isinstance(child, ReminderWidget):
                child.label.text_size = (self.width * 0.65 - dp(20), None)

    def add_specific_reminder(self, instance):
        """Add a new reminder."""
        date = self.new_specific_date.text
        reminder_text = self.new_specific_reminder.text
        if date and reminder_text:
            try:
                 # Parse the date input to validate and normalize to  YYYY-MM-DD  format
                parsed_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
                normalized_date = parsed_date.strftime('%Y-%m-%d')
                reminder_widget = ReminderWidget(
                    date=normalized_date,
                    reminder_text=reminder_text,
                    screen_width=self.width,
                    edit_callback=self.edit_reminder,
                    delete_callback=self.delete_specific_reminder
                )
                self.reminders_layout.add_widget(reminder_widget)
                self.new_specific_date.text = ""
                self.new_specific_reminder.text = ""
                self.app.specific_date_reminders[normalized_date] = reminder_text
                self.update_specific_reminders_display()
                self.app.save_reminders()  # Save after adding
                self.app.main_screen.update_reminders_display()  # Update main screen
                self.fade_error_message()
            except ValueError:
                self.error_label.text = "Invalid date format. Please use<ctrl98>-MM-DD."
                self.fade_error_message()
        else:
            self.error_label.text = "Please enter both date and reminder text."
            self.fade_error_message()

    def edit_reminder(self, date, current_reminder):
        self.current_editing_date = date
        content = BoxLayout(orientation='vertical', spacing=10)
        date_label = Label(text=f"Date: {date}")
        input_text = TextInput(text=current_reminder, multiline=False, size_hint=(1, None), height=60)
        save_button = Button(text="Save", size_hint_y=None, height=50)
        content.add_widget(date_label)
        content.add_widget(input_text)
        content.add_widget(save_button)

        self.edit_popup = Popup(title="Edit Specific Reminder", content=content, size_hint=(None, None), size=(400, 250))
        save_button.bind(on_press=lambda btn: self.save_edited_specific_reminder(input_text.text, self.edit_popup))
        self.edit_popup.open()
    
    def save_edited_specific_reminder(self, new_text, popup):
        new_text = new_text.strip()
        if new_text and self.current_editing_date in self.app.specific_date_reminders:
            self.app.specific_date_reminders[self.current_editing_date] = new_text
            self.app.save_reminders()  
            self.update_specific_reminders_display()
            self.app.main_screen.update_reminders_display()  # Update main screen
            self.fade_error_message()
        else:
            self.error_label.text = "Reminder text cannot be empty."
            self.fade_error_message()
        if popup:
            popup.dismiss()
        self.current_editing_date = None

    def delete_specific_reminder(self, date):
        if date in self.app.specific_date_reminders:
            del self.app.specific_date_reminders[date]
            self.app.save_reminders()  
            self.update_specific_reminders_display()
            self.app.main_screen.update_reminders_display()  # Update main screen
            self.fade_error_message()
        

    def update_specific_reminders_display(self, *args):
        """Update the reminders display."""
        self.reminders_layout.clear_widgets()
        # print(self.app.specific_date_reminders)
        for date, reminder_text in self.app.specific_date_reminders.items():
            reminder_widget = ReminderWidget(
                date=date,
                reminder_text=reminder_text,
                screen_width=self.width,
                edit_callback=self.edit_reminder,
                delete_callback=self.delete_specific_reminder
            )
            self.reminders_layout.add_widget(reminder_widget)
    
    def fade_error_message(self):
        anim = Animation(opacity=0, duration=3)
        anim.start(self.error_label)
        Clock.schedule_once(self.reset_error_opacity, 3)

    def reset_error_opacity(self, dt):
        self.error_label.opacity = 1
        self.error_label.text = ""

if __name__ == '__main__':
    ReminderApp().run()